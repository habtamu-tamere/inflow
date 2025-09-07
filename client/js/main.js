// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// Modal functionality
const setupModals = () => {
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const createCampaignBtn = document.getElementById('createCampaignBtn');
  const switchToRegister = document.getElementById('switchToRegister');
  const switchToLogin = document.getElementById('switchToLogin');
  const closeButtons = document.querySelectorAll('.close-modal');

  loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
  });

  registerBtn.addEventListener('click', () => {
    registerModal.style.display = 'flex';
  });

  if (createCampaignBtn) {
    createCampaignBtn.addEventListener('click', () => {
      window.location.href = 'create-campaign.html';
    });
  }

  switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
  });

  switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
  });

  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      loginModal.style.display = 'none';
      registerModal.style.display = 'none';
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === registerModal) registerModal.style.display = 'none';
  });
};

// Authentication
const setupAuth = () => {
  document.querySelector('#loginModal .auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      setToken(response.data.token);
      alert('Login successful!');
      document.getElementById('loginModal').style.display = 'none';
      loadUserData();
    } catch (error) {
      alert(error.response.data.message || 'Login failed');
    }
  });

  document.querySelector('#registerModal .auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    try {
      const response = await axios.post('/api/auth/register', { name, email, password, role });
      setToken(response.data.token);
      alert('Registration successful!');
      document.getElementById('registerModal').style.display = 'none';
      loadUserData();
    } catch (error) {
      alert(error.response.data.message || 'Registration failed');
    }
  });
};

// Load user data
const loadUserData = async () => {
  const token = getToken();
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const createCampaignBtn = document.getElementById('createCampaignBtn');

  if (token) {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      loginBtn.textContent = 'Logout';
      loginBtn.removeEventListener('click', setupModals);
      loginBtn.addEventListener('click', () => {
        removeToken();
        loginBtn.textContent = 'Login';
        loginBtn.addEventListener('click', setupModals);
        if (createCampaignBtn) createCampaignBtn.style.display = 'none';
        registerBtn.style.display = 'block';
        alert('Logged out');
        if (window.location.pathname.includes('create-campaign.html')) {
          window.location.href = 'index.html';
        }
      });
      registerBtn.style.display = 'none';
      if (response.data.role === 'brand' && createCampaignBtn) {
        createCampaignBtn.style.display = 'block';
      }
    } catch (error) {
      removeToken();
      if (createCampaignBtn) createCampaignBtn.style.display = 'none';
      if (window.location.pathname.includes('create-campaign.html')) {
        window.location.href = 'index.html';
      }
    }
  }
};

// Tab switching (for index.html)
const switchTab = (tabName) => {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabName + '-tab').classList.add('active');
  event.currentTarget.classList.add('active');
  if (tabName === 'campaigns') loadCampaigns();
  else loadInfluencers();
};

// Load campaigns (for index.html)
const loadCampaigns = async () => {
  if (!window.location.pathname.includes('index.html')) return;
  const industry = document.getElementById('industry').value;
  const budget = document.getElementById('budget').value;
  const performance = document.getElementById('performance').value;

  try {
    const response = await axios.get('/api/campaigns', { params: { industry, budget, performance } });
    const campaigns = response.data;
    const cardGrid = document.querySelector('#campaigns-tab .card-grid');
    cardGrid.innerHTML = campaigns.map(campaign => `
      <div class="card campaign-card">
        <div class="card-header">
          <h3><a href="campaign.html?id=${campaign._id}">${campaign.title}</a></h3>
          <span class="campaign-badge">${campaign.performanceModel}</span>
        </div>
        <div class="card-body">
          <p>${campaign.description}</p>
          <div class="niche-tags">
            ${campaign.nicheTags.map(tag => `<span class="niche-tag">${tag}</span>`).join('')}
          </div>
          <div class="stats">
            <div class="stat">
              <span class="stat-value">${campaign.budget}</span>
              <span class="stat-label">Budget</span>
            </div>
            <div class="stat">
              <span class="stat-value">${campaign.applications.length}</span>
              <span class="stat-label">Applications</span>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <span>Deadline: ${campaign.deadline}</span>
          <button class="btn btn-primary btn-sm" onclick="applyToCampaign('${campaign._id}')">Apply Now</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading campaigns:', error);
  }
};

// Load influencers (for index.html)
const loadInfluencers = async () => {
  if (!window.location.pathname.includes('index.html')) return;
  const niche = document.getElementById('influencer-niche').value;
  const followers = document.getElementById('followers').value;
  const rate = document.getElementById('rate').value;

  try {
    const response = await axios.get('/api/influencers', { params: { niche, followers, rate } });
    const influencers = response.data;
    const cardGrid = document.querySelector('#influencers-tab .card-grid');
    cardGrid.innerHTML = influencers.map(influencer => `
      <div class="card influencer-card">
        <div class="card-header">
          <div class="influencer-avatar">
            <img src="${influencer.avatar}" alt="${influencer.name}">
          </div>
          <div class="influencer-info">
            <h3><a href="profile.html?id=${influencer._id}">${influencer.name}</a></h3>
            <p>${influencer.niche}</p>
          </div>
        </div>
        <div class="card-body">
          <div class="stats">
            <div class="stat">
              <span class="stat-value">${influencer.followers.toLocaleString()}</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="stat">
              <span class="stat-value">${influencer.engagement}%</span>
              <span class="stat-label">Engagement</span>
            </div>
            <div class="stat">
              <span class="stat-value">$${influencer.rate}</span>
              <span class="stat-label">Rate/Post</span>
            </div>
          </div>
          <div class="niche-tags">
            ${influencer.nicheTags.map(tag => `<span class="niche-tag">${tag}</span>`).join('')}
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-outline" onclick="window.location.href='profile.html?id=${influencer._id}'">View Profile</button>
          <button class="btn btn-primary">Contact</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading influencers:', error);
  }
};

// Apply to campaign
const applyToCampaign = async (campaignId) => {
  const token = getToken();
  if (!token) {
    alert('Please login to apply');
    document.getElementById('loginModal').style.display = 'flex';
    return;
  }

  try {
    await axios.post(`/api/campaigns/${campaignId}/apply`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert('Application submitted successfully!');
  } catch (error) {
    alert(error.response.data.message || 'Application failed');
  }
};

// Load influencer profile (for profile.html)
const loadInfluencerProfile = async () => {
  if (!window.location.pathname.includes('profile.html')) return;
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  try {
    const response = await axios.get(`/api/influencers/${id}`);
    const influencer = response.data;
    document.getElementById('profile-avatar').src = influencer.avatar;
    document.getElementById('profile-name').textContent = influencer.name;
    document.getElementById('profile-niche').textContent = influencer.niche;
    document.getElementById('profile-email').textContent = influencer.user.email;
    document.getElementById('profile-followers').textContent = influencer.followers.toLocaleString();
    document.getElementById('profile-engagement').textContent = `${influencer.engagement}%`;
    document.getElementById('profile-rate').textContent = `$${influencer.rate}`;
    document.getElementById('profile-niche-tags').innerHTML = influencer.nicheTags.map(tag => `<span class="niche-tag">${tag}</span>`).join('');
  } catch (error) {
    alert(error.response.data.message || 'Failed to load profile');
  }
};

// Load campaign details (for campaign.html)
const loadCampaignDetails = async () => {
  if (!window.location.pathname.includes('campaign.html')) return;
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  try {
    const response = await axios.get(`/api/campaigns/${id}`);
    const campaign = response.data;
    document.getElementById('campaign-title').textContent = campaign.title;
    document.getElementById('campaign-badge').textContent = campaign.performanceModel;
    document.getElementById('campaign-description').textContent = campaign.description;
    document.getElementById('campaign-budget').textContent = campaign.budget;
    document.getElementById('campaign-applications').textContent = campaign.applications.length;
    document.getElementById('campaign-deadline').textContent = campaign.deadline;
    document.getElementById('campaign-niche-tags').innerHTML = campaign.nicheTags.map(tag => `<span class="niche-tag">${tag}</span>`).join('');
    document.getElementById('campaign-applicants').innerHTML = campaign.applications.map(applicant => `<li>${applicant.name}</li>`).join('');
    document.getElementById('applyBtn').addEventListener('click', () => applyToCampaign(id));
  } catch (error) {
    alert(error.response.data.message || 'Failed to load campaign');
  }
};

// Create campaign (for create-campaign.html)
const setupCreateCampaign = () => {
  if (!window.location.pathname.includes('create-campaign.html')) return;
  const form = document.getElementById('create-campaign-form');
  const nicheTagsInput = document.getElementById('campaign-niche-tags');
  const nicheTagsContainer = document.getElementById('niche-tags-container');
  let nicheTags = [];

  nicheTagsInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tags = nicheTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
      nicheTags = [...new Set([...nicheTags, ...tags])]; // Remove duplicates
      nicheTagsContainer.innerHTML = nicheTags.map(tag => `
        <span class="niche-tag">${tag}<span class="remove-tag" onclick="removeTag('${tag}')">×</span></span>
      `).join('');
      nicheTagsInput.value = '';
    }
  });

  window.removeTag = (tag) => {
    nicheTags = nicheTags.filter(t => t !== tag);
    nicheTagsContainer.innerHTML = nicheTags.map(tag => `
      <span class="niche-tag">${tag}<span class="remove-tag" onclick="removeTag('${tag}')">×</span></span>
    `).join('');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      alert('Please login as a brand to create a campaign');
      document.getElementById('loginModal').style.display = 'flex';
      return;
    }

    const campaignData = {
      title: document.getElementById('campaign-title').value,
      description: document.getElementById('campaign-description').value,
      industry: document.getElementById('campaign-industry').value,
      budget: document.getElementById('campaign-budget').value,
      performanceModel: document.getElementById('campaign-performance').value,
      nicheTags,
      deadline: document.getElementById('campaign-deadline').value,
    };

    try {
      await axios.post('/api/campaigns', campaignData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Campaign created successfully!');
      window.location.href = 'index.html#campaigns-tab';
    } catch (error) {
      alert(error.response.data.message || 'Failed to create campaign');
    }
  });
};

// Filter buttons (for index.html)
const setupFilters = () => {
  if (!window.location.pathname.includes('index.html')) return;
  document.querySelectorAll('.filters .btn-primary').forEach(button => {
    button.addEventListener('click', () => {
      const activeTab = document.querySelector('.tab.active').textContent.toLowerCase();
      if (activeTab === 'campaigns') loadCampaigns();
      else loadInfluencers();
    });
  });
};

// Initialize
setupModals();
setupAuth();
loadUserData();
loadCampaigns();
loadInfluencers();
loadInfluencerProfile();
loadCampaignDetails();
setupCreateCampaign();
setupFilters();




// // Token management
// const getToken = () => localStorage.getItem('token');
// const setToken = (token) => localStorage.setItem('token', token);
// const removeToken = () => localStorage.removeItem('token');

// // Modal functionality
// const loginModal = document.getElementById('loginModal');
// const registerModal = document.getElementById('registerModal');
// const loginBtn = document.getElementById('loginBtn');
// const registerBtn = document.getElementById('registerBtn');
// const switchToRegister = document.getElementById('switchToRegister');
// const switchToLogin = document.getElementById('switchToLogin');
// const closeButtons = document.querySelectorAll('.close-modal');

// loginBtn.addEventListener('click', () => {
//   loginModal.style.display = 'flex';
// });

// registerBtn.addEventListener('click', () => {
//   registerModal.style.display = 'flex';
// });

// switchToRegister.addEventListener('click', (e) => {
//   e.preventDefault();
//   loginModal.style.display = 'none';
//   registerModal.style.display = 'flex';
// });

// switchToLogin.addEventListener('click', (e) => {
//   e.preventDefault();
//   registerModal.style.display = 'none';
//   loginModal.style.display = 'flex';
// });

// closeButtons.forEach(button => {
//   button.addEventListener('click', () => {
//     loginModal.style.display = 'none';
//     registerModal.style.display = 'none';
//   });
// });

// window.addEventListener('click', (e) => {
//   if (e.target === loginModal) loginModal.style.display = 'none';
//   if (e.target === registerModal) registerModal.style.display = 'none';
// });

// // Authentication
// document.querySelector('#loginModal .auth-form').addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const email = document.getElementById('login-email').value;
//   const password = document.getElementById('login-password').value;

//   try {
//     const response = await axios.post('/api/auth/login', { email, password });
//     setToken(response.data.token);
//     alert('Login successful!');
//     loginModal.style.display = 'none';
//     loadUserData();
//   } catch (error) {
//     alert(error.response.data.message || 'Login failed');
//   }
// });

// document.querySelector('#registerModal .auth-form').addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const name = document.getElementById('register-name').value;
//   const email = document.getElementById('register-email').value;
//   const password = document.getElementById('register-password').value;
//   const role = document.getElementById('register-role').value;

//   try {
//     const response = await axios.post('/api/auth/register', { name, email, password, role });
//     setToken(response.data.token);
//     alert('Registration successful!');
//     registerModal.style.display = 'none';
//     loadUserData();
//   } catch (error) {
//     alert(error.response.data.message || 'Registration failed');
//   }
// });

// // Load user data
// const loadUserData = async () => {
//   const token = getToken();
//   if (token) {
//     try {
//       const response = await axios.get('/api/auth/me', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       loginBtn.textContent = 'Logout';
//       loginBtn.removeEventListener('click', openLoginModal);
//       loginBtn.addEventListener('click', () => {
//         removeToken();
//         loginBtn.textContent = 'Login';
//         loginBtn.addEventListener('click', openLoginModal);
//         alert('Logged out');
//       });
//       registerBtn.style.display = 'none';
//     } catch (error) {
//       removeToken();
//     }
//   }
// };

// // Tab switching
// function switchTab(tabName) {
//   document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
//   document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
//   document.getElementById(tabName + '-tab').classList.add('active');
//   event.currentTarget.classList.add('active');
//   if (tabName === 'campaigns') loadCampaigns();
//   else loadInfluencers();
// }

// // Load campaigns
// const loadCampaigns = async () => {
//   const industry = document.getElementById('industry').value;
//   const budget = document.getElementById('budget').value;
//   const performance = document.getElementById('performance').value;

//   try {
//     const response = await axios.get('/api/campaigns', { params: { industry, budget, performance } });
//     const campaigns = response.data;
//     const cardGrid = document.querySelector('#campaigns-tab .card-grid');
//     cardGrid.innerHTML = campaigns.map(campaign => `
//       <div class="card campaign-card">
//         <div class="card-header">
//           <h3>${campaign.title}</h3>
//           <span class="campaign-badge">${campaign.performanceModel}</span>
//         </div>
//         <div class="card-body">
//           <p>${campaign.description}</p>
//           <div class="niche-tags">
//             ${campaign.nicheTags.map(tag => `<span class="niche-tag">${tag}</span>`).join('')}
//           </div>
//           <div class="stats">
//             <div class="stat">
//               <span class="stat-value">${campaign.budget}</span>
//               <span class="stat-label">Budget</span>
//             </div>
//             <div class="stat">
//               <span class="stat-value">${campaign.applications.length}</span>
//               <span class="stat-label">Applications</span>
//             </div>
//           </div>
//         </div>
//         <div class="card-footer">
//           <span>Deadline: ${campaign.deadline}</span>
//           <button class="btn btn-primary btn-sm" onclick="applyToCampaign('${campaign._id}')">Apply Now</button>
//         </div>
//       </div>
//     `).join('');
//   } catch (error) {
//     console.error('Error loading campaigns:', error);
//   }
// };

// // Load influencers
// const loadInfluencers = async () => {
//   const niche = document.getElementById('influencer-niche').value;
//   const followers = document.getElementById('followers').value;
//   const rate = document.getElementById('rate').value;

//   try {
//     const response = await axios.get('/api/influencers', { params: { niche, followers, rate } });
//     const influencers = response.data;
//     const cardGrid = document.querySelector('#influencers-tab .card-grid');
//     cardGrid.innerHTML = influencers.map(influencer => `
//       <div class="card influencer-card">
//         <div class="card-header">
//           <div class="influencer-avatar">
//             <img src="${influencer.avatar}" alt="${influencer.name}">
//           </div>
//           <div class="influencer-info">
//             <h3>${influencer.name}</h3>
//             <p>${influencer.niche}</p>
//           </div>
//         </div>
//         <div class="card-body">
//           <div class="stats">
//             <div class="stat">
//               <span class="stat-value">${influencer.followers.toLocaleString()}</span>
//               <span class="stat-label">Followers</span>
//             </div>
//             <div class="stat">
//               <span class="stat-value">${influencer.engagement}%</span>
//               <span class="stat-label">Engagement</span>
//             </div>
//             <div class="stat">
//               <span class="stat-value">$${influencer.rate}</span>
//               <span class="stat-label">Rate/Post</span>
//             </div>
//           </div>
//           <div class="niche-tags">
//             ${influencer.nicheTags.map(tag => `<span class="niche-tag">${tag}</span>`).join('')}
//           </div>
//         </div>
//         <div class="card-footer">
//           <button class="btn btn-outline">View Profile</button>
//           <button class="btn btn-primary">Contact</button>
//         </div>
//       </div>
//     `).join('');
//   } catch (error) {
//     console.error('Error loading influencers:', error);
//   }
// };

// // Apply to campaign
// const applyToCampaign = async (campaignId) => {
//   const token = getToken();
//   if (!token) {
//     alert('Please login to apply');
//     loginModal.style.display = 'flex';
//     return;
//   }

//   try {
//     await axios.post(`/api/campaigns/${campaignId}/apply`, {}, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     alert('Application submitted successfully!');
//   } catch (error) {
//     alert(error.response.data.message || 'Application failed');
//   }
// };

// // Filter buttons
// document.querySelectorAll('.filters .btn-primary').forEach(button => {
//   button.addEventListener('click', () => {
//     const activeTab = document.querySelector('.tab.active').textContent.toLowerCase();
//     if (activeTab === 'campaigns') loadCampaigns();
//     else loadInfluencers();
//   });
// });

// // Initial load
// loadUserData();
// loadCampaigns();













// // Tab switching functionality
    // function switchTab(tabName) {
    //     // Hide all tab contents
    //     document.querySelectorAll('.tab-content').forEach(tab => {
    //         tab.classList.remove('active');
    //     });
        
    //     // Remove active class from all tabs
    //     document.querySelectorAll('.tab').forEach(tab => {
    //         tab.classList.remove('active');
    //     });
        
    //     // Show the selected tab content
    //     document.getElementById(tabName + '-tab').classList.add('active');
        
    //     // Activate the clicked tab
    //     event.currentTarget.classList.add('active');
    // }
    
    // // Modal functionality
    // const loginModal = document.getElementById('loginModal');
    // const registerModal = document.getElementById('registerModal');
    // const loginBtn = document.getElementById('loginBtn');
    // const registerBtn = document.getElementById('registerBtn');
    // const switchToRegister = document.getElementById('switchToRegister');
    // const switchToLogin = document.getElementById('switchToLogin');
    // const closeButtons = document.querySelectorAll('.close-modal');
    
    // loginBtn.addEventListener('click', () => {
    //     loginModal.style.display = 'flex';
    // });
    
    // registerBtn.addEventListener('click', () => {
    //     registerModal.style.display = 'flex';
    // });
    
    // switchToRegister.addEventListener('click', (e) => {
    //     e.preventDefault();
    //     loginModal.style.display = 'none';
    //     registerModal.style.display = 'flex';
    // });
    
    // switchToLogin.addEventListener('click', (e) => {
    //     e.preventDefault();
    //     registerModal.style.display = 'none';
    //     loginModal.style.display = 'flex';
    // });
    
    // closeButtons.forEach(button => {
    //     button.addEventListener('click', () => {
    //         loginModal.style.display = 'none';
    //         registerModal.style.display = 'none';
    //     });
    // });
    
    // window.addEventListener('click', (e) => {
    //     if (e.target === loginModal) {
    //         loginModal.style.display = 'none';
    //     }
    //     if (e.target === registerModal) {
    //         registerModal.style.display = 'none';
    //     }
    // });
    
    // // Apply buttons functionality
    // document.querySelectorAll('.btn-primary').forEach(button => {
    //     if (button.textContent === 'Apply Now') {
    //         button.addEventListener('click', function() {
    //             alert('Application system would open here. In a real application, this would connect to a Node.js backend with MongoDB/Mongoose.');
    //         });
    //     }
    // });
    
    // // Simulate authentication (for demo purposes)
    // const authForms = document.querySelectorAll('.auth-form');
    // authForms.forEach(form => {
    //     form.addEventListener('submit', (e) => {
    //         e.preventDefault();
    //         alert('Authentication system would process here. In a real application, this would connect to a Node.js backend with hashed passwords using bcrypt and JWT tokens.');
            
    //         // Close the modal after submission
    //         loginModal.style.display = 'none';
    //         registerModal.style.display = 'none';
    //     });
    // });