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
}
function closeModal() {
    var modal = document.getElementById("imageModal");
    modal.style.display = "none";
}
document.querySelectorAll('.productImage').forEach(img => {
    img.addEventListener('click', function() {
        const productName = this.dataset.productName;
        const productDescription = this.dataset.productDescription;
        const productPrice = this.dataset.productPrice;
        openModal(this, productName, productDescription, productPrice);
    });
});
var modal = document.getElementById("imageModal");
modal.addEventListener("click", function(event) {
    if (event.target === modal) {
        closeModal();
    }
});
