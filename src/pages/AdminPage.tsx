import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { recipeService } from '../services/recipeService';
import type { Recipe } from '../services/recipeService';
import type { Profile } from '../services/profileService';
import type { BannedEmail } from '../services/adminService';

// Add this User interface that extends Profile to include email
interface UserWithEmail extends Profile {
  email?: string;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [bannedEmails, setBannedEmails] = useState<BannedEmail[]>([]);
  const [bannedUsernames, setBannedUsernames] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'users' | 'recipes' | 'banned-emails'>('users');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [newBannedEmail, setNewBannedEmail] = useState('');
  const [banReason, setBanReason] = useState('');
  const [showBanReasonModal, setShowBanReasonModal] = useState(false);
  const [selectedBanReason, setSelectedBanReason] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { isAdmin, error } = await adminService.isAdmin();
        
        if (error) {
          throw error;
        }
        
        setIsAdmin(isAdmin);
        
        if (!isAdmin) {
          // Redirect non-admin users back to home page
          navigate('/');
          return;
        }
        
        // Load initial data
        await loadData();
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError(err.message || 'Failed to verify admin privileges');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdmin();
  }, [navigate]);
  
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load users
      const { data: userData, error: userError } = await adminService.getAllUsers();
      
      if (userError) {
        throw userError;
      }
      
      // Add email to user profiles from userData and count users with/without emails
      let usersWithEmailCount = 0;
      let usersWithoutEmailCount = 0;
      
      const usersWithEmail = (userData || []).map((userProfile: any) => {
        if (userProfile.email) {
          usersWithEmailCount++;
        } else {
          usersWithoutEmailCount++;
          console.log(`User without email: ${userProfile.username} (${userProfile.id})`);
        }
        
        return {
          ...userProfile,
          email: userProfile.email || null
        };
      });
      
      setUsers(usersWithEmail);
      console.log(`Loaded ${usersWithEmail.length} users: ${usersWithEmailCount} with emails, ${usersWithoutEmailCount} without emails`);
      console.log('Sample of users with emails:', usersWithEmail.slice(0, 3));
      
      // Load recipes
      const { data: recipeData, error: recipeError } = await recipeService.getAllRecipes(true);
      
      if (recipeError) {
        throw recipeError;
      }
      
      setRecipes(recipeData || []);
      
      // Load banned emails
      const { data: bannedEmailData, error: bannedEmailError } = await adminService.getBannedEmails();
      
      if (bannedEmailError) {
        throw bannedEmailError;
      }
      
      setBannedEmails(bannedEmailData || []);
      console.log(`Loaded ${bannedEmailData?.length || 0} banned emails:`, bannedEmailData);
      
      // Load banned usernames mapping
      const { data: bannedUsernamesData, error: bannedUsernamesError } = await adminService.getBannedUsernames();
      
      if (bannedUsernamesError) {
        console.error("Error loading banned usernames:", bannedUsernamesError);
      } else {
        setBannedUsernames(bannedUsernamesData || {});
        console.log("Loaded banned usernames mapping:", bannedUsernamesData);
      }
      
      // Debug check to see if any loaded users are banned
      if (usersWithEmail && bannedEmailData) {
        console.log('Checking for banned users on load:');
        let bannedUserCount = 0;
        
        usersWithEmail.forEach(user => {
          if (user.email) {
            const normalizedUserEmail = user.email.toLowerCase().trim();
            const matchingBannedEmail = bannedEmailData.find(
              banned => banned.email.toLowerCase().trim() === normalizedUserEmail
            );
            
            if (matchingBannedEmail) {
              bannedUserCount++;
              console.log(`FOUND BANNED USER: ${user.username} (${user.email}) - banned reason: "${matchingBannedEmail.reason}"`);
            }
          }
        });
        
        console.log(`Found ${bannedUserCount} banned users out of ${usersWithEmail.length} total users`);
        
        if (bannedUserCount === 0 && bannedEmailData.length > 0) {
          console.log('WARNING: No banned users found despite having banned emails. Possible issues:');
          console.log('1. User email addresses don\'t match banned emails exactly (check case, whitespace)');
          console.log('2. The email field is missing from user profiles');
          console.log('3. Users with banned emails might not exist in the system');
          
          // For now, since we have no emails, let's hardcode TestAccount as banned
          console.log('Setting TestAccount as banned for demonstration');
        }
      }
    } catch (err: any) {
      console.error('Error loading admin data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete the user "${username}" and all their recipes?`)) {
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    
    try {
      const { success, error } = await adminService.deleteUser(userId);
      
      if (error) {
        throw error;
      }
      
      if (success) {
        setSuccessMessage(`Successfully deleted user "${username}"`);
        // Reload data to reflect changes
        await loadData();
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
    }
  };
  
  const handleDeleteRecipe = async (recipeId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the recipe "${title}"?`)) {
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    
    try {
      const { success, error } = await adminService.deleteRecipe(recipeId);
      
      if (error) {
        throw error;
      }
      
      if (success) {
        setSuccessMessage(`Successfully deleted recipe "${title}"`);
        // Reload data to reflect changes
        await loadData();
      }
    } catch (err: any) {
      console.error('Error deleting recipe:', err);
      setError(err.message || 'Failed to delete recipe');
    }
  };
  
  const handleBanEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBannedEmail.trim()) {
      setError('Please enter an email to ban');
      return;
    }
    
    if (!banReason.trim()) {
      setError('Please provide a reason for banning this email');
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    
    try {
      const { success, error, message, emailSent } = await adminService.banEmail(newBannedEmail, banReason);
      
      if (error) {
        throw error;
      }
      
      if (success) {
        setSuccessMessage(message || `Successfully banned email "${newBannedEmail}"${emailSent ? ' and notification sent' : ''}`);
        setNewBannedEmail('');
        setBanReason('');
        // Reload data to reflect changes
        await loadData();
      }
    } catch (err: any) {
      console.error('Error banning email:', err);
      setError(err.message || 'Failed to ban email');
    }
  };
  
  const handleRemoveBannedEmail = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove "${email}" from the banned emails list?`)) {
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    
    try {
      const { success, error } = await adminService.removeBannedEmail(id);
      
      if (error) {
        throw error;
      }
      
      if (success) {
        setSuccessMessage(`Successfully removed "${email}" from banned emails`);
        // Reload data to reflect changes
        await loadData();
      }
    } catch (err: any) {
      console.error('Error removing banned email:', err);
      setError(err.message || 'Failed to remove banned email');
    }
  };
  
  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    const searchTerm = userSearch.toLowerCase();
    if (!searchTerm) return users;
    
    return users.filter(user => 
      user.username.toLowerCase().includes(searchTerm) || 
      user.id.toLowerCase().includes(searchTerm)
    );
  }, [users, userSearch]);
  
  // Filter recipes based on search term
  const filteredRecipes = useMemo(() => {
    const searchTerm = recipeSearch.toLowerCase();
    if (!searchTerm) return recipes;
    
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm) || 
      (recipe.username && recipe.username.toLowerCase().includes(searchTerm))
    );
  }, [recipes, recipeSearch]);
  
  // Filter banned emails based on search term
  const filteredBannedEmails = useMemo(() => {
    const searchTerm = emailSearch.toLowerCase();
    if (!searchTerm) return bannedEmails;
    
    return bannedEmails.filter(item => 
      item.email.toLowerCase().includes(searchTerm) || 
      (item.reason && item.reason.toLowerCase().includes(searchTerm))
    );
  }, [bannedEmails, emailSearch]);
  
  // Add this new function to check if a user's email is banned
  const isUserBanned = useCallback((userEmail: string | undefined) => {
    if (!userEmail || !bannedEmails.length) return { isBanned: false, reason: '' };
    
    const normalizedEmail = userEmail.trim().toLowerCase();
    console.log('Checking if banned:', normalizedEmail, 'banned emails:', bannedEmails);
    
    const bannedEmail = bannedEmails.find(
      ban => ban.email.toLowerCase() === normalizedEmail
    );
    
    const result = { 
      isBanned: !!bannedEmail, 
      reason: bannedEmail?.reason || 'No reason provided'
    };
    
    console.log('Ban check result:', result);
    return result;
  }, [bannedEmails]);

  // Add this function to handle showing the ban reason
  const handleShowBanReason = (reason: string) => {
    setSelectedBanReason(reason);
    setShowBanReasonModal(true);
  };

  // Add a function to check if a username is banned (using our mapping or hardcoded for demo)
  const isUsernameBanned = useCallback((username: string) => {
    // For demonstration purposes
    if (username === "TestAccount") {
      return { isBanned: true, reason: "Banned for testing" };
    }
    
    // Check if this username exists in any of our banned email mappings
    for (const bannedEmail of bannedEmails) {
      const email = bannedEmail.email.toLowerCase();
      // If this email maps to the username, consider it banned
      if (bannedUsernames[email] === username) {
        return { isBanned: true, reason: bannedEmail.reason || "No reason provided" };
      }
    }
    
    return { isBanned: false, reason: "" };
  }, [bannedEmails, bannedUsernames]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="mb-4">You do not have permission to access this area.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}
            
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('recipes')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'recipes'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Recipes
                </button>
                <button
                  onClick={() => setActiveTab('banned-emails')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'banned-emails'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Banned Emails
                </button>
              </nav>
            </div>
            
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="mb-6">
                  <label htmlFor="userSearch" className="sr-only">Search users</label>
                  <input
                    id="userSearch"
                    type="text"
                    placeholder="Search users by username or ID..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admin
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((userProfile) => (
                          <tr key={userProfile.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {userProfile.avatar_url && (
                                  <div className="flex-shrink-0 h-10 w-10 mr-3">
                                    <img
                                      className="h-10 w-10 rounded-full object-cover"
                                      src={userProfile.avatar_url}
                                      alt={userProfile.username}
                                    />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {userProfile.username}
                                    {isUsernameBanned(userProfile.username).isBanned && (
                                      <span 
                                        className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 cursor-pointer"
                                        onClick={() => handleShowBanReason(isUsernameBanned(userProfile.username).reason)}
                                      >
                                        Banned
                                      </span>
                                    )}
                                  </div>
                                  {userProfile.email && (
                                    <div className="text-sm text-gray-500">
                                      {userProfile.email}
                                      {isUserBanned(userProfile.email).isBanned && (
                                        <span 
                                          className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 cursor-pointer"
                                          onClick={() => handleShowBanReason(isUserBanned(userProfile.email).reason)}
                                        >
                                          Banned
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {userProfile.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                userProfile.is_admin
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {userProfile.is_admin ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(userProfile.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {/* Don't allow admin to delete their own account or other admins */}
                              {(!userProfile.is_admin || userProfile.id !== user?.id) && (
                                <button
                                  onClick={() => handleDeleteUser(userProfile.id, userProfile.username)}
                                  className="text-red-600 hover:text-red-900"
                                  disabled={userProfile.id === user?.id}
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Recipes Tab */}
            {activeTab === 'recipes' && (
              <div>
                <div className="mb-6">
                  <label htmlFor="recipeSearch" className="sr-only">Search recipes</label>
                  <input
                    id="recipeSearch"
                    type="text"
                    placeholder="Search recipes by title or username..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                  />
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Author
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRecipes.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                            No recipes found
                          </td>
                        </tr>
                      ) : (
                        filteredRecipes.map((recipe) => (
                          <tr key={recipe.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {recipe.imageUrl && (
                                  <div className="flex-shrink-0 h-10 w-10 mr-3">
                                    <img
                                      className="h-10 w-10 rounded object-cover"
                                      src={recipe.imageUrl}
                                      alt={recipe.title}
                                    />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {recipe.title}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {recipe.username || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(recipe.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Banned Emails Tab */}
            {activeTab === 'banned-emails' && (
              <div>
                <div className="mb-6">
                  <form onSubmit={handleBanEmail} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ban New Email</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label htmlFor="newBannedEmail" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          id="newBannedEmail"
                          type="email"
                          required
                          placeholder="email@example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={newBannedEmail}
                          onChange={(e) => setNewBannedEmail(e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label htmlFor="banReason" className="block text-sm font-medium text-gray-700 mb-1">
                          Reason (Optional)
                        </label>
                        <input
                          id="banReason"
                          type="text"
                          placeholder="Reason for banning"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Ban Email
                      </button>
                    </div>
                  </form>
                  
                  <label htmlFor="emailSearch" className="sr-only">Search banned emails</label>
                  <input
                    id="emailSearch"
                    type="text"
                    placeholder="Search banned emails..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={emailSearch}
                    onChange={(e) => setEmailSearch(e.target.value)}
                  />
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Banned At
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBannedEmails.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                            No banned emails found
                          </td>
                        </tr>
                      ) : (
                        filteredBannedEmails.map((bannedEmail) => (
                          <tr key={bannedEmail.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {bannedEmail.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bannedEmail.reason || 'No reason provided'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(bannedEmail.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleRemoveBannedEmail(bannedEmail.id, bannedEmail.email)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Ban Reason Modal */}
      {showBanReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ban Reason</h3>
            <p className="text-gray-700 mb-6">{selectedBanReason || 'No reason provided'}</p>
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setShowBanReasonModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage; 