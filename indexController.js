if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    .then(function(registration) {
        console.log("Service worker registered successfully")
    }).catch(error=>{
        console.log(`An error occurred: ${error}`)
    })}