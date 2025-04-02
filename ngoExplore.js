function openModal(imgElement) {
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("modalImg");
    
    modal.style.display = "flex";
    modalImg.src = imgElement.src;
  }
  
  function closeModal() {
    var modal = document.getElementById("imageModal");
    modal.style.display = "none";
  }
  
  document.querySelectorAll('.postImage').forEach(img => {
    img.addEventListener('click', function() {
      openModal(this);
    });
  });
  