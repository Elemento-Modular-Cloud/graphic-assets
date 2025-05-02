$(document).ready(function() {
  // Global variable to store the original image
  let originalImage = new Image();
  let originalImageName = 'example-image'; // default name

  // Draw default image in canvas on load
  const canvas = document.getElementById('main-canvas');
  const ctx = canvas.getContext('2d');
  const defaultImg = new Image();
  defaultImg.src = 'example-image.jpg'; // Update path if needed
  defaultImg.onload = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(defaultImg, 0, 0, canvas.width, canvas.height);
    // Store the original image
    originalImage.src = defaultImg.src;
    // Set default mask if needed (optional, if not set in HTML)
    // $('#maskSelector').val('your-default-mask.svg');
    // Apply blur with the default mask
    applyBlurWithInverseMask();
  }

  // Handle image upload
  $('#image-upload').on('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    // Store the original file name (without extension)
    originalImageName = file.name.replace(/\.[^/.]+$/, "");
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Store the uploaded image as the new original
        originalImage.src = img.src;
        // Apply blur with the default mask
        applyBlurWithInverseMask();
      }
      img.src = e.target.result;
    }
    reader.readAsDataURL(file);
  });

  // Helper: Load SVG as an image and get preserveAspectRatio
  function loadSVGMask(maskPath, callback) {
    fetch(maskPath)
      .then(response => {
        if (!response.ok) {
          // Mask file not found
          alert(`Mask file not found: ${maskPath}`);
          throw new Error(`Mask file not found: ${maskPath}`);
        }
        return response.text();
      })
      .then(svgText => {
        // Parse SVG to get preserveAspectRatio
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElem = svgDoc.documentElement;
        const preserveAspectRatio = svgElem.getAttribute('preserveAspectRatio') || 'xMidYMid meet';

        // Create image for drawing
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(svgText);
        img.onload = function() {
          callback(img, preserveAspectRatio, svgElem);
        };
      })
      .catch(error => {
        // Optionally handle the error further here
        console.error(error);
      });
  }

  // Apply blur with inverse mask
  function applyBlurWithInverseMask() {
    const canvas = document.getElementById('main-canvas');
    const ctx = canvas.getContext('2d');
    const selectedMask = "./masks/" + $('#maskSelector').val();

    // Draw the original image to the canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    // Create an offscreen canvas for the blurred image
    const offCanvas = document.createElement('canvas');
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    const offCtx = offCanvas.getContext('2d');
    offCtx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    offCtx.filter = 'blur(10px) saturate(80%) brightness(1.1)';
    offCtx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);
    offCtx.filter = 'none';

    // Load the SVG mask
    loadSVGMask(selectedMask, function(maskImg, preserveAspectRatio, svgElem) {
      // Step 1: Prepare the inverted mask on a separate canvas
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext('2d');

      // Get SVG's viewBox for aspect ratio calculation
      const viewBox = svgElem.getAttribute('viewBox');
      let svgWidth = maskImg.width;
      let svgHeight = maskImg.height;
      if (viewBox) {
        const vb = viewBox.split(' ').map(Number);
        svgWidth = vb[2];
        svgHeight = vb[3];
      }

      if (preserveAspectRatio === 'none') {
        // Stretch to fill canvas
        maskCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
      } else {
        // Maintain aspect ratio
        const canvasAspect = canvas.width / canvas.height;
        const svgAspect = svgWidth / svgHeight;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (svgAspect > canvasAspect) {
          // SVG is wider than canvas
          drawWidth = canvas.width;
          drawHeight = canvas.width / svgAspect;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          // SVG is taller than canvas
          drawHeight = canvas.height;
          drawWidth = canvas.height * svgAspect;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        }
        maskCtx.drawImage(maskImg, offsetX, offsetY, drawWidth, drawHeight);
      }

      // Step 2: Create a blurred image masked by the inverted mask
      const blurMaskedCanvas = document.createElement('canvas');
      blurMaskedCanvas.width = canvas.width;
      blurMaskedCanvas.height = canvas.height;
      const blurMaskedCtx = blurMaskedCanvas.getContext('2d');

      // Draw the blurred image
      blurMaskedCtx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);

      // Use the inverted mask as an alpha mask
      blurMaskedCtx.globalCompositeOperation = 'destination-in';
      blurMaskedCtx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
      blurMaskedCtx.globalCompositeOperation = 'source-over';

      // Step 3: Draw the masked blurred image on top of the original
      ctx.drawImage(blurMaskedCanvas, 0, 0, canvas.width, canvas.height);
    });
  }

  // Example: Apply blur when mask is changed
  $('#maskSelector').on('change', function() {
    applyBlurWithInverseMask();
  });

  // Optionally, call applyBlurWithInverseMask() after image upload as well

  // Download handler
  $('#download-btn').on('click', function() {
    const canvas = document.getElementById('main-canvas');
    const format = $('input[name="download-format"]:checked').val();
    let mimeType = 'image/png';
    let extension = 'png';

    if (format === 'jpeg') {
      mimeType = 'image/jpeg';
      extension = 'jpg';
    } else if (format === 'webp') {
      mimeType = 'image/webp';
      extension = 'webp';
    }

    const maskValue = $('#maskSelector').val();
    const maskName = maskValue.replace(/\.[^/.]+$/, "");
    const link = document.createElement('a');
    link.download = `${originalImageName}__${maskName}.${extension}`;
    link.href = canvas.toDataURL(mimeType);
    link.click();
  });
});

