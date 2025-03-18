import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, username: currentUsername } = useAuth();
  const [pageVisible, setPageVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current profile data
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await profileService.getProfileByUserId(user.id);
        
        if (error) throw error;
        
        setUsername(data?.username || '');
        setAvatarUrl(data?.avatar_url || null);
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
        setPageVisible(true);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    
    // Validate file type and size
    if (!file.type.match('image.*')) {
      setError('Please select an image file (png, jpg, jpeg)');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB max
      setError('Image size should be less than 2MB');
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    setError(null);
    
    try {
      // Track upload process data for consolidated logging
      const logData: {
        operation: string;
        file: {
          name: string;
          size: number;
          type: string;
        };
        userId: string;
        status: string;
        publicUrl?: string;
      } = {
        operation: 'avatar_upload',
        file: {
          name: file.name,
          size: file.size,
          type: file.type
        },
        userId: user.id,
        status: 'started'
      };
      
      // Upload the avatar
      const { publicUrl } = await profileService.uploadAvatar(user.id, file);
      
      // Update log data with success info
      logData.status = 'success';
      logData.publicUrl = publicUrl;
      console.log('Avatar operation:', logData);
      
      // Update state with the new avatar URL
      setAvatarUrl(publicUrl);
      
      setSuccess('Profile picture updated successfully');
    } catch (error) {
      console.error('Avatar upload failed:', { 
        userId: user.id,
        fileName: file.name,
        fileSize: file.size,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setError(`Failed to upload profile picture: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !avatarUrl) return;
    
    const confirmed = window.confirm('Are you sure you want to remove your profile picture?');
    if (!confirmed) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Extract the file path from the URL
      const urlParts = avatarUrl.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('avatars')).join('/');
      
      await profileService.deleteAvatar(user.id, filePath);
      
      setAvatarUrl(null);
      setSuccess('Profile picture removed successfully');
    } catch (error) {
      console.error('Error removing avatar:', error);
      setError('Failed to remove profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate username
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }
    
    if (username.length < 3 || username.length > 20) {
      setError('Username must be between 3 and 20 characters');
      return;
    }
    
    // If username hasn't changed, skip the update
    if (username === currentUsername) {
      navigate('/profile');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Check if username is available (skip check if username hasn't changed)
      const { available } = await profileService.isUsernameAvailable(username);
      
      if (!available) {
        setError('Username is already taken. Please choose another one.');
        setIsSaving(false);
        return;
      }
      
      // Update the profile
      const { error } = await profileService.updateProfile(user.id, { username });
      
      if (error) throw error;
      
      setSuccess('Profile updated successfully');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (isLoading && !pageVisible) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto p-4 mt-8 transition-opacity duration-500 ${pageVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-blue-600">Edit Profile</h1>
        <p className="text-gray-600">Update your profile information</p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8 mb-8">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Profile Picture</h2>
            
            <div className="flex flex-col items-center">
              <div 
                className="w-32 h-32 rounded-full mb-4 relative cursor-pointer overflow-hidden"
                onClick={triggerFileInput}
              >
                {avatarUrl ? (
                  <div className="w-full h-full">
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        console.error('Avatar display error:', { 
                          url: img.src, 
                          userId: user?.id,
                          error: 'Failed to load image'
                        });
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <span className="text-4xl text-blue-600">
                      {username ? username[0].toUpperCase() : user?.email?.[0].toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-sm font-medium">Change Photo</span>
                </div>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                  disabled={isLoading}
                >
                  Upload Picture
                </button>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Account Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block mb-2 font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your username"
                  disabled={isLoading || isSaving}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Only letters, numbers, and underscores. Between 3-20 characters.
                </p>
              </div>
              
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  readOnly
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email cannot be changed
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between space-x-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition"
              disabled={isSaving}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition flex items-center justify-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage; 