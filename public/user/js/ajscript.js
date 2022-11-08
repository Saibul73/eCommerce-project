

 
 function addtocart(productId){
    console.log('add to cart vilichu',productId)
    
      
    $.ajax({
        url:'/addtocart/'+productId,
        method:"get",
        success:(response)=>{
          if(response.status){
            console.log(response.status,"ADDTOCARTSCRIPT")
            let count = document.getElementById('cart-count')
            countValue =count.getAttribute('data-notify')
            console.log(countValue)
            count.setAttribute('data-notify',parseInt(countValue)+1)
            
            Swal.fire({ 
              title: 'Added to Cart',  
              icon: 'success', 
               })


          }  
        }
    })

 }

 function addtowishlist(productId){
  console.log('add to wishlist vilichu',productId)
  $.ajax({
      url:'/add-wishlist/'+productId,
      method:"get",
      success:(response)=>{
        // console.log(response.exist,'TEESST')
        if(response.status){
          console.log(response.status,"ADDTOwishSCRIPT")
          let count = document.getElementById('wish-count')
          countValue =count.getAttribute('data-notify')
          console.log(countValue)
          count.setAttribute('data-notify',parseInt(countValue)+1)
         
        }
        else{
          alert("product already exists")
        }  
      }
  })

}
