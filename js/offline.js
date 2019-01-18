window.addEventListener('load',()=>{
  if(navigator.onLine){
    DBHelper.checkOfflineReviews();
  }
});