(function(){
  if(localStorage.getItem('mc_admin_auth')!=='true'){window.location.href='../admin-login.html';}
})();
document.addEventListener('DOMContentLoaded',function(){
  var u=localStorage.getItem('mc_admin_user')||'admin';
  var us=document.getElementById('au'); if(us) us.textContent=u;
  var av=document.getElementById('av'); if(av) av.textContent=u.charAt(0).toUpperCase();
});
function logout(){
  localStorage.removeItem('mc_admin_auth');
  localStorage.removeItem('mc_admin_user');
  localStorage.removeItem('mc_admin_login_time');
  window.location.href='../admin-login.html';
}
