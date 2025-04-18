function openModal(imgElement, productName, productDescription, productPrice) {
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("modalImg");
    var modalProductName = document.getElementById("modalProductName");
    var modalProductDescription = document.getElementById("modalProductDescription");
    var modalProductPrice = document.getElementById("modalProductPrice");

    modal.style.display = "flex";
    modalImg.src = imgElement.src;
    modalProductName.textContent = productName;
    modalProductDescription.textContent = productDescription;
    modalProductPrice.textContent = productPrice;

    var buyNowBtn = document.getElementById("buyNowBtn");
    if (buyNowBtn) {
        buyNowBtn.onclick = function () {
            createCheckoutSession(productName, productPrice);
        };
    } else {
        console.error("Buy Now button not found.");
    }
}
function closeModal() {
    var modal = document.getElementById("imageModal");
    modal.style.display = "none";
}

function createCheckoutSession(productName, productPrice) {
    fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productName: productName,
            productPrice: productPrice
        }),
    })
    .then(function (response) {
        return response.json();
    })
    .then(function (sessionId) {
        var stripe = Stripe('pk_test_51RBMvvRrBw2cTi1AnWBPfP1ETIRFUHJMdq7PLCqUQ8dsmFb5rfUKFxvxO0RqC16N4SUQN5T5sm0ZUysEj8f2a75D00rX9uzN0g'); 
        return stripe.redirectToCheckout({ sessionId: sessionId });
    })
    .then(function (result) {
        if (result.error) {
            alert(result.error.message);
        }
    })
    .catch(function (error) {
        console.error("Error:", error);
    });
}

document.querySelectorAll('.productImage').forEach(img => {
    img.addEventListener('click', function() {
        const productName = this.dataset.productName;
        const productDescription = this.dataset.productDescription;
        const productPrice = this.dataset.productPrice;
        openModal(this, productName, productDescription, productPrice);
    });
});

function handleBuyNowClick() {
    const productName = "Product Name";  
    const productPrice = 29.99;  //parse from product info

    createCheckoutSession(productName, productPrice);
}


var modal = document.getElementById("imageModal");
modal.addEventListener("click", function(event) {
    if (event.target === modal) {
        closeModal();
    }
});
