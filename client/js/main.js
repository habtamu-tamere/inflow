const API_BASE_URL = window.location.hostname.includes('localhost')
  ? 'http://localhost:5000'
  : 'https://inflow-tiy3.onrender.com';

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

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      console.log('Opening login modal');
      loginModal.style.display = 'flex';
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      console.log('Opening register modal');
      registerModal.style.display = 'flex';
    });
  }

  if (createCampaignBtn) {
    createCampaignBtn.addEventListener('click', () => {
      console.log('Navigating to create-campaign.html');
      window.location.href = '/create-campaign.html';
    });
  }

  if (switchToRegister) {
    switchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Switching to register modal');
      loginModal.style.display = 'none';
      registerModal.style.display = 'flex';
    });
  }

  if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Switching to login modal');
      registerModal.style.display = 'none';
      loginModal.style.display = 'flex';
    });
  }

  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      console.log('Closing modals');
      loginModal.style.display = 'none';
      registerModal.style.display = 'none';
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === loginModal || e.target === registerModal) {
      console.log('Closing modal via backdrop');
      loginModal.style.display = 'none';
      registerModal.style.display = 'none';
    }
  });
};

// Authentication
const setupAuth = () => {
  const loginForm = document.querySelector('#loginModal .auth-form');
  const registerForm = document.querySelector('#registerModal .auth-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      console.log('Login attempt:', { email });

      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
        console.log('Login response:', response.data);
        setToken(response.data.token);
        alert('Login successful!');
        loginModal.style.display = 'none';
        loadUserData();
      } catch (error) {
        console.error('Login error:', error.response || error.message);
        alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const role = document.getElementById('register-role').value;
      console.log('Register attempt:', { name, email, role });

      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password, role });
        console.log('Register response:', response.data);
        setToken(response.data.token);
        alert('Registration successful!');
        registerModal.style.display = 'none';
        loadUserData();
      } catch (error) {
        console.error('Register error:', error.response || error.message);
        alert(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    });
  }
};

// Load user data
const loadUserData = async () => {
  const token = getToken();
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const createCampaignBtn = document.getElementById('createCampaignBtn');

  if (token) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('User data:', response.data);
      if (loginBtn) {
        loginBtn.textContent = 'Logout';
        loginBtn.removeEventListener('click', setupModals);
        loginBtn.addEventListener('click', () => {
          console.log('Logging out');
          removeToken();
          loginBtn.textContent = 'Login';
          loginBtn.addEventListener('click', setupModals);
          if (createCampaignBtn) createCampaignBtn.style.display = 'none';
          if (registerBtn) registerBtn.style.display = 'block';
          alert('Logged out');
          if (window.location.pathname.includes('create-campaign.html')) {
            window.location.href = '/index.html';
          }
        });
      }
      if (registerBtn) registerBtn.style.display = 'none';
      if (response.data.role === 'brand' && createCampaignBtn) {
        console.log('Showing create campaign button for brand');
        createCampaignBtn.style.display = 'block';
      }
    } catch (error) {
      console.error('User data error:', error.response || error.message);
      removeToken();
      if (createCampaignBtn) createCampaignBtn.style.display = 'none';
      if (window.location.pathname.includes('create-campaign.html')) {
        window.location.href = '/index.html';
      }
    }
  }
};

// Tab switching (for index.html)
const switchTab = (tabName) => {
  if (!window.location.pathname.includes('index.html')) return;
  console.log('Switching tab to:', tabName);
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
  const industry = document.getElementById('industry')?.value || '';
  const budget = document.getElementById('budget')?.value || '';
  const performance = document.getElementById('performance')?.value || '';
  console.log('Loading campaigns with filters:', { industry, budget, performance });

  try {
    const response = await axios.get(`${API_BASE_URL}/api/campaigns`, { params: { industry, budget, performance } });
    const campaigns = response.data;
    console.log('Campaigns loaded:', campaigns);
    const cardGrid = document.querySelector('#campaigns-tab .card-grid');
    if (cardGrid) {
      cardGrid.innerHTML = campaigns.length ? campaigns.map(campaign => `
        <div class="card campaign-card">
          <div class="card-header">
            <h3><a href="/campaign.html?id=${campaign._id}">${campaign.title}</a></h3>
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
      `).join('') : '<p>No campaigns found.</p>';
    }
  } catch (error) {
    console.error('Error loading campaigns:', error.response || error.message);
    alert(error.response?.data?.message || 'Failed to load campaigns');
  }
};

// Load influencers (for index.html)
const loadInfluencers = async () => {
  if (!window.location.pathname.includes('index.html')) return;
  const niche = document.getElementById('influencer-niche')?.value || '';
  const followers = document.getElementById('followers')?.value || '';
  const rate = document.getElementById('rate')?.value || '';
  console.log('Loading influencers with filters:', { niche, followers, rate });

  try {
    const response = await axios.get(`${API_BASE_URL}/api/influencers`, { params: { niche, followers, rate } });
    const influencers = response.data;
    console.log('Influencers loaded:', influencers);
    const cardGrid = document.querySelector('#influencers-tab .card-grid');
    if (cardGrid) {
      cardGrid.innerHTML = influencers.length ? influencers.map(influencer => `
        <div class="card influencer-card">
          <div class="card-header">
            <div class="influencer-avatar">
              <img src="${influencer.avatar}" alt="${influencer.name}">
            </div>
            <div class="influencer-info">
              <h3><a href="/profile.html?id=${influencer._id}">${influencer.name}</a></h3>
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
            <button class="btn btn-outline" onclick="window.location.href='/profile.html?id=${influencer._id}'">View Profile</button>
            <button class="btn btn-primary">Contact</button>
          </div>
        </div>
      `).join('') : '<p>No influencers found.</p>';
    }
  } catch (error) {
    console.error('Error loading influencers:', error.response || error.message);
    alert(error.response?.data?.message || 'Failed to load influencers');
  }
};

// Apply to campaign
const applyToCampaign = async (campaignId) => {
  const token = getToken();
  if (!token) {
    console.log('No token, opening login modal');
    alert('Please login to apply');
    document.getElementById('loginModal').style.display = 'flex';
    return;
  }

  try {
    console.log('Applying to campaign:', campaignId);
    await axios.post(`${API_BASE_URL}/api/campaigns/${campaignId}/apply`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert('Application submitted successfully!');
  } catch (error) {
    console.error('Apply error:', error.response || error.message);
    alert(error.response?.data?.message || 'Application failed');
  }
};

// Load influencer profile (for profile.html)
const loadInfluencerProfile = async () => {
  if (!window.location.pathname.includes('profile.html')) return;
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  console.log('Loading influencer profile:', id);

  try {
    const response = await axios.get(`${API_BASE_URL}/api/influencers/${id}`);
    const influencer = response.data;
    console.log('Influencer profile loaded:', influencer);
    document.getElementById('profile-avatar').src = influencer.avatar;
    document.getElementById('profile-name').textContent = influencer.name;
    document.getElementById('profile-niche').textContent = influencer.niche;
    document.getElementById('profile-email').textContent = influencer.user.email;
    document.getElementById('profile-followers').textContent = influencer.followers.toLocaleString();
    document.getElementById('profile-engagement').textContent = `${influencer.engagement}%`;
    document.getElementById('profile-rate').textContent = `$${influencer.rate}`;
    document.getElementById('profile-niche-tags').innerHTML = influencer.nicheTags.map(tag => `<span class="niche-tag">${tag}</span>`).join('');
  } catch (error) {
    console.error('Profile error:', error.response || error.message);
    alert(error.response?.data?.message || 'Failed to load profile');
  }
};

// Load campaign details (for campaign.html)
const loadCampaignDetails = async () => {
  if (!window.location.pathname.includes('campaign.html')) return;
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  console.log('Loading campaign details:', id);

  try {
    const response = await axios.get(`${API_BASE_URL}/api/campaigns/${id}`);
    const campaign = response.data;
    console.log('Campaign details loaded:', campaign);
    document.getElementById('campaign-title').textContent = campaign.title;
    document.getElementById('campaign-badge').textContent = campaign.performanceModel;
    document.getElementById('campaign-description').textContent = campaign.description;
    document.getElementById('campaign-budget').textContent = campaign.budget;
    document.getElementById('campaign-applications').textContent = campaign.applications.length;
    document.getElementById('campaign-deadline').textContent = campaign.deadline;
    document.getElementById('campaign-niche-tags').innerHTML = campaign.nicheTags.map(tag => `<span class="niche-tag">${tag}</span>`).join('');
    document.getElementById('campaign-applicants').innerHTML = campaign.applications.length
      ? campaign.applications.map(applicant => `<li>${applicant.name}</li>`).join('')
      : '<li>No applicants yet.</li>';
    document.getElementById('applyBtn').addEventListener('click', () => applyToCampaign(id));
  } catch (error) {
    console.error('Campaign details error:', error.response || error.message);
    alert(error.response?.data?.message || 'Failed to load campaign');
  }
};

// Create campaign (for create-campaign.html)
const setupCreateCampaign = () => {
  if (!window.location.pathname.includes('create-campaign.html')) return;
  const form = document.getElementById('create-campaign-form');
  const nicheTagsInput = document.getElementById('campaign-niche-tags');
  const nicheTagsContainer = document.getElementById('niche-tags-container');
  let nicheTags = [];

  if (nicheTagsInput) {
    nicheTagsInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const tags = nicheTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        nicheTags = [...new Set([...nicheTags, ...tags])];
        console.log('Niche tags updated:', nicheTags);
        nicheTagsContainer.innerHTML = nicheTags.map(tag => `
          <span class="niche-tag">${tag}<span class="remove-tag" onclick="removeTag('${tag}')">×</span></span>
        `).join('');
        nicheTagsInput.value = '';
      }
    });
  }

  window.removeTag = (tag) => {
    nicheTags = nicheTags.filter(t => t !== tag);
    console.log('Niche tag removed:', tag);
    nicheTagsContainer.innerHTML = nicheTags.map(tag => `
      <span class="niche-tag">${tag}<span class="remove-tag" onclick="removeTag('${tag}')">×</span></span>
    `).join('');
  };

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = getToken();
      if (!token) {
        console.log('No token, opening login modal');
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
      console.log('Creating campaign:', campaignData);

      try {
        await axios.post(`${API_BASE_URL}/api/campaigns`, campaignData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Campaign created successfully!');
        window.location.href = '/index.html#campaigns-tab';
      } catch (error) {
        console.error('Create campaign error:', error.response || error.message);
        alert(error.response?.data?.message || 'Failed to create campaign');
      }
    });
  }
};

// Filter buttons (for index.html)
const setupFilters = () => {
  if (!window.location.pathname.includes('index.html')) return;
  document.querySelectorAll('.filters .btn-primary').forEach(button => {
    button.addEventListener('click', () => {
      const activeTab = document.querySelector('.tab.active')?.textContent.toLowerCase();
      console.log('Applying filters for:', activeTab);
      if (activeTab === 'campaigns') loadCampaigns();
      else loadInfluencers();
    });
  });
};

// Initialize
console.log('Initializing frontend');
setupModals();
setupAuth();
loadUserData();
loadCampaigns();
loadInfluencers();
loadInfluencerProfile();
loadCampaignDetails();
setupCreateCampaign();
setupFilters();