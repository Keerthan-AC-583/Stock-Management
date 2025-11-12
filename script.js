
const state = { page:'home', user:null, stocks:[], viewing:'see' };

const content = document.getElementById('content');
const mainNav = document.getElementById('main-nav');
const userMenu = document.getElementById('user-menu');
const profileBtn = document.getElementById('profile-btn');
const sidebar = document.getElementById('sidebar');

// Navbar + dropdown actions
document.getElementById('home-btn').onclick = ()=> goTo('home');
document.getElementById('dashboard-link').onclick = ()=> goTo('dashboard');
document.getElementById('logout-btn').onclick = ()=> logout();
profileBtn.onclick = ()=> userMenu.classList.toggle('show');
window.onclick = e=>{ if(!e.target.matches('.profile-btn')) userMenu.classList.remove('show'); };

// Middle (hero) Log In / Sign Up
function setupAuthButtons(){
  const btnIn = document.getElementById('main-log-in');
  const btnUp = document.getElementById('main-sign-up');
  if(btnIn) btnIn.onclick = ()=> goTo('login');
  if(btnUp) btnUp.onclick = ()=> goTo('signup');
}

function updateNav() {
  if(state.user){
    profileBtn.style.display='inline-block';
    profileBtn.textContent = state.user.name + ' ▼';
    sidebar.style.display = '';
  } else {
    profileBtn.style.display='none';
    sidebar.style.display = 'none';
  }
}

function goTo(page){
  state.page=page;
  render();
  highlightSidebar(page);
}

function logout(){
  state.user=null;
  state.page='home';
  render();
  sidebar.style.display = 'none';
}

function render(){
  if(state.page!=='home') document.body.classList.remove('home-page');
  else document.body.classList.add('home-page');
  updateNav();
  if(state.page==='home') renderHome();
  else if(state.page==='signup') renderSignup();
  else if(state.page==='login') renderLogin();
  else if(state.page==='dashboard'){ if(!state.user){goTo('login');return;} renderDashboard(); }
  else if(state.page==='stocks'){ if(!state.user){goTo('login');return;} renderStocks(); }
  else if(state.page==='sell'){ if(!state.user){goTo('login');return;} renderSell(); }
  else if(state.page==='add'){ if(!state.user){goTo('login');return;} renderAddStock(); }
}

function renderHome(){
  content.innerHTML=`
    <h2>Welcome to Stock Management</h2>
    <p color="blue">Efficiently organize, track, and manage your inventory. Get started now!</p>
    <div class="center-auth">
      <button id="main-log-in" class="primary">Log In</button>
      <button id="main-sign-up" class="primary">Sign Up</button>
    </div>
    <div style="margin-top:2.5rem;">
      <div class="feature-card">
        <strong>Multi-warehouse Management</strong>
        <p>Handle product shortages, transfer items, and generate reports for each warehouse.</p>
      </div>
      <div class="feature-card">
        <strong>All Orders in One Place</strong>
        <p>Track and fulfill orders across channels, just like Zoho Inventory.</p>
      </div>
      <div class="feature-card">
        <strong>Sales & Invoicing</strong>
        <p>Create price offers, receive notifications for low stock, and manage returns with ease.</p>
      </div>
    </div>
  `;
  setupAuthButtons();
}

function renderSignup(){
  content.innerHTML=`
    <h2>Sign Up</h2>
    <form id="signup-form">
      <label>Name:</label><input type="text" name="name" required /><br>
      <label>Phone:</label><input type="tel" name="phone" pattern="[0-9]{10}" required /><br>
      <label>Permanent Address:</label><textarea name="perm" rows="2" required></textarea><br>
      <label>Shop Address:</label><textarea name="shop" rows="2" required></textarea><br>
      <label>Password:</label><input type="password" name="password" minlength="6" required /><br>
      <button class="primary" type="submit">Register</button>
    </form>
  `;
  document.getElementById('signup-form').onsubmit=e=>{
    e.preventDefault();
    state.user={
      name:e.target.name.value,
      phone:e.target.phone.value,
      permAddress:e.target.perm.value,
      shopAddress:e.target.shop.value,
      password:e.target.password.value
    };
    alert('Registered! Please log in.');
    goTo('login');
  }
}

function renderLogin(){
  content.innerHTML=`
    <h2>Log In</h2>
    <form id="login-form">
      <label>Phone:</label><input type="tel" name="phone" pattern="[0-9]{10}" required />
      <label>Password:</label><input type="password" name="password" minlength="6" required />
      <button class="primary" type="submit">Log In</button>
    </form>
  `;
  document.getElementById('login-form').onsubmit=e=>{
    e.preventDefault();
    const phone=e.target.phone.value, pw=e.target.password.value;
    if(state.user && state.user.phone===phone && state.user.password===pw){
      alert(`Welcome, ${state.user.name}!`);
      goTo('dashboard');
    } else alert('Invalid phone or password');
  }
}

function renderDashboard(){
  content.innerHTML=`
    <h2>Dashboard</h2>
    <div class="feature-card">
      <strong>Quick Links</strong>
      <div style="display:flex;gap:1rem;justify-content:center;margin-top:0.6rem;">
        <button class="primary" id="goto-stocks">Stocks</button>
        <button class="primary" id="goto-sell">Sell</button>
        <button class="primary" id="goto-add">Add Stock</button>
      </div>
    </div>
    <div class="feature-card">
      <strong>Inventory Summary</strong>
      <p>Total items: ${state.stocks.length}</p>
    </div>
    <div class="feature-card">
      <strong>Welcome, ${state.user.name}!</strong>
      <p>Use the sidebar or Quick Links to manage your business.</p>
    </div>
  `;
  document.getElementById('goto-stocks').onclick=()=>goTo('stocks');
  document.getElementById('goto-sell').onclick=()=>goTo('sell');
  document.getElementById('goto-add').onclick=()=>goTo('add');
  setupSidebar();
}

function renderStocks(){
  let html=`
    <h2>Stocks</h2>
    <button class="primary" id="see-stock-btn">See Stock</button>
    <button class="primary" id="add-stock-btn">Add Stock</button>
    <div id="stock-content"></div>
  `;
  content.innerHTML = html;
  document.getElementById('see-stock-btn').onclick = showSee;
  document.getElementById('add-stock-btn').onclick = renderAddStock;
  showSee();
  setupSidebar();
}

function showSee(){
  const stockContent = document.getElementById('stock-content');
  if(state.stocks.length===0){ stockContent.innerHTML='<p>No stocks yet.</p>'; return; }
  let html='<table><thead><tr><th>Name</th><th>Qty</th><th>Price</th><th>Actions</th></tr></thead><tbody>';
  state.stocks.forEach((s,i)=>{
    html+=`<tr>
      <td>${s.name}</td>
      <td>${s.quantity}</td>
      <td>${s.price}</td>
      <td>
        <button class="btn-small" onclick="sellStock(${i})">Sell</button>
        <button class="btn-small" onclick="editStock(${i})">Edit</button>
        <button class="btn-small btn-danger" onclick="delStock(${i})">Delete</button>
      </td>
    </tr>`;
  });
  html+='</tbody></table>';
  stockContent.innerHTML = html;
}

window.sellStock = function(i){
  let q=parseInt(prompt('Quantity to sell','1'));
  if(q>0) state.stocks[i].quantity=Math.max(0,state.stocks[i].quantity-q);
  showSee();
}
window.editStock = function(i){
  let n=prompt('Name',state.stocks[i].name);
  let q=parseInt(prompt('Quantity',state.stocks[i].quantity));
  let p=parseFloat(prompt('Price',state.stocks[i].price));
  if(n) state.stocks[i]={name:n,quantity:q,price:p};
  showSee();
}
window.delStock = function(i){ if(confirm('Delete?')) state.stocks.splice(i,1); showSee(); }

function renderSell(){
  content.innerHTML=`
    <h2>Sell Stock</h2>
    <form id="sell-form">
      <label>Item:</label>
      <select name="selitem" required>
        ${state.stocks.map((s,i)=>`<option value="${i}">${s.name} (${s.quantity} available)</option>`).join('')}
      </select>
      <label>Quantity to Sell:</label>
      <input type="number" name="sellqty" min="1" required>
      <button class="primary" type="submit">Sell</button>
    </form>
    <div id="sell-result"></div>
  `;
  document.getElementById('sell-form').onsubmit = e=>{
    e.preventDefault();
    const idx = e.target.selitem.value,
          qty = parseInt(e.target.sellqty.value);
    if(qty>0 && qty <= state.stocks[idx].quantity){
      state.stocks[idx].quantity -= qty;
      document.getElementById('sell-result').textContent = `Sold ${qty} of ${state.stocks[idx].name}`;
      renderDashboard();
    } else {
      document.getElementById('sell-result').textContent = 'Invalid quantity!';
    }
  };
  setupSidebar();
}

function renderAddStock(){
  content.innerHTML=`
    <h2>Add Stock</h2>
    <form id="add-form">
      <label>Item Name:</label><input type="text" id="iname" required/>
      <label>Quantity:</label><input type="number" id="iquantity" min="1" required/>
      <label>Price:</label><input type="number" id="iprice" min="0" step="0.01" required/>
      <button class="primary" type="submit">Add</button>
    </form>
    <div id="add-result"></div>
  `;
  document.getElementById('add-form').onsubmit=e=>{
    e.preventDefault();
    const n=document.getElementById('iname').value;
    const q=parseInt(document.getElementById('iquantity').value);
    const p=parseFloat(document.getElementById('iprice').value).toFixed(2);
    if(!n||q<=0||p<0){ document.getElementById('add-result').textContent = 'Invalid!'; return; }
    state.stocks.push({name:n,quantity:q,price:p});
    document.getElementById('add-result').textContent = 'Added!';
    renderStocks();
  }
  setupSidebar();
}

// Sidebar Navigation Event Setup
function setupSidebar(){
  document.getElementById('side-dashboard').onclick=()=>goTo('dashboard');
  document.getElementById('side-stocks').onclick=()=>goTo('stocks');
  document.getElementById('side-sell').onclick=()=>goTo('sell');
  document.getElementById('side-add').onclick=()=>goTo('add');
  highlightSidebar(state.page);
}
function highlightSidebar(page){
  if(!sidebar) return;
  Array.from(document.getElementsByClassName('sidebar-btn')).forEach(btn=>
    btn.classList.remove('active'));
  if(page==='dashboard' || page==='home')
    document.getElementById('side-dashboard').classList.add('active');
  else if(page==='stocks')
    document.getElementById('side-stocks').classList.add('active');
  else if(page==='sell')
    document.getElementById('side-sell').classList.add('active');
  else if(page==='add')
    document.getElementById('side-add').classList.add('active');
}

// Initial render
render();
