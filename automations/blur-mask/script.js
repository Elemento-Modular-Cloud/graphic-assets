$(document).ready(function() {
  // Global variable to store the original image
  let originalImage = new Image();
  let originalImageName = 'example-image'; // default name

  // Add these variables at the top with other global variables
  let blurAmount = 10;
  let saturationAmount = 80;
  let brightnessAmount = 110;
  let invertMask = false; // Add this new variable
  let flipHorizontal = false;
  let maskScale = 100; // Add this new variable for mask scaling (in percentage)

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

  // Add this new function to update the filter
  function updateFilter() {
    blurAmount = $('#blur-slider').val();
    saturationAmount = $('#saturation-slider').val();
    brightnessAmount = $('#brightness-slider').val();
    invertMask = $('#invert-mask').is(':checked');
    flipHorizontal = $('#flip-horizontal').is(':checked');
    maskScale = $('#mask-scale-slider').val();
    applyBlurWithInverseMask();
  }

  // Apply blur with inverse mask
  function applyBlurWithInverseMask() {
    const canvas = document.getElementById('main-canvas');
    const ctx = canvas.getContext('2d');
    const selectedMask = "./masks/" + $('#maskSelector').val();
    const maskPath = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/') + "masks/" + $('#maskSelector').val();
    console.log("Selected Mask Path:", maskPath);

    // Draw the original image to the canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (flipHorizontal) {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        ctx.restore();
    } else {
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    }

    // Create an offscreen canvas for the blurred image
    const offCanvas = document.createElement('canvas');
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    const offCtx = offCanvas.getContext('2d');
    if (flipHorizontal) {
        offCtx.save();
        offCtx.translate(canvas.width, 0);
        offCtx.scale(-1, 1);
        offCtx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        offCtx.restore();
    } else {
        offCtx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    }
    offCtx.filter = `blur(${blurAmount}px) saturate(${saturationAmount}%) brightness(${brightnessAmount}%)`;
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
        // Stretch to fill canvas with scaling
        const scaledWidth = canvas.width * (maskScale / 100);
        const scaledHeight = canvas.height * (maskScale / 100);
        const offsetX = (canvas.width - scaledWidth) / 2;
        const offsetY = (canvas.height - scaledHeight) / 2;
        maskCtx.drawImage(maskImg, offsetX, offsetY, scaledWidth, scaledHeight);
      } else {
        // Maintain aspect ratio with scaling
        const canvasAspect = canvas.width / canvas.height;
        const svgAspect = svgWidth / svgHeight;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (svgAspect > canvasAspect) {
          // SVG is wider than canvas
          drawWidth = canvas.width * (maskScale / 100);
          drawHeight = drawWidth / svgAspect;
        } else {
          // SVG is taller than canvas
          drawHeight = canvas.height * (maskScale / 100);
          drawWidth = drawHeight * svgAspect;
        }
        
        // Center the mask regardless of its size
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = (canvas.height - drawHeight) / 2;
        
        maskCtx.drawImage(maskImg, offsetX, offsetY, drawWidth, drawHeight);
      }

      // Step 2: Create a blurred image masked by the inverted mask
      const blurMaskedCanvas = document.createElement('canvas');
      blurMaskedCanvas.width = canvas.width;
      blurMaskedCanvas.height = canvas.height;
      const blurMaskedCtx = blurMaskedCanvas.getContext('2d');

      // Draw the blurred image
      blurMaskedCtx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);

      // Use the mask as an alpha mask (inverted or not based on the toggle)
      blurMaskedCtx.globalCompositeOperation = invertMask ? 'destination-out' : 'destination-in';
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

  // Add event listeners for the sliders
  $('#blur-slider, #saturation-slider, #brightness-slider').on('input', updateFilter);

  // Add event listener for the invert mask checkbox
  $('#invert-mask').on('change', updateFilter);

  // Add event listener for the flip horizontal checkbox
  $('#flip-horizontal').on('change', updateFilter);

  // Add event listener for the mask scale slider
  $('#mask-scale-slider').on('input', function() {
    $('#mask-scale-value').text($(this).val() + '%');
    updateFilter();
  });

  // Optionally, call applyBlurWithInverseMask() after image upload as well

  // Download handler for direct download
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
    
    // Create a settings string that encodes the filter values
    const settingsString = `b${blurAmount}s${saturationAmount}br${brightnessAmount}`;
    
    const fileName = `${originalImageName}__${maskName}__${settingsString}.${extension}`;
    
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL(mimeType);
    link.click();
  });

  // Save As handler with native dialog
  $('#save-as-btn').on('click', async function() {
    try {
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
      
      // Create a settings string that encodes the filter values
      const settingsString = `b${blurAmount}s${saturationAmount}br${brightnessAmount}`;
      
      const fileName = `${originalImageName}__${maskName}__${settingsString}.${extension}`;

      // Show the native save dialog
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: 'Image file',
          accept: {
            [mimeType]: [`.${extension}`]
          }
        }]
      });

      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType));
      
      // Create a FileSystemWritableFileStream to write to
      const writable = await handle.createWritable();
      
      // Write the blob to the file
      await writable.write(blob);
      
      // Close the file
      await writable.close();
    } catch (err) {
      // If the user cancels the save dialog or if the API is not supported
      console.error('Error saving file:', err);
      // Fallback to the old method if the new API fails
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL(mimeType);
      link.click();
    }
  });

  // Reset handler
  $('#reset-btn').on('click', function() {
    // Reset sliders to default values
    $('#blur-slider').val(10);
    $('#saturation-slider').val(80);
    $('#brightness-slider').val(110);
    $('#invert-mask').prop('checked', false);
    $('#flip-horizontal').prop('checked', false);
    $('#mask-scale-slider').val(100);
    $('#mask-scale-value').text('100%');
    
    // Update the display values
    $('#blur-value').text('10px');
    $('#saturation-value').text('80%');
    $('#brightness-value').text('110%');
    
    // Reset the first mask option
    $('#maskSelector').val('Asset 1.svg');
    
    // Apply the reset values
    updateFilter();
  });

  // Add this inside the document.ready function
  $('#blur-slider').on('input', function() {
    $('#blur-value').text($(this).val() + 'px');
  });

  $('#saturation-slider').on('input', function() {
    $('#saturation-value').text($(this).val() + '%');
  });

  $('#brightness-slider').on('input', function() {
    $('#brightness-value').text($(this).val() + '%');
  });
});

// Add this at the beginning of your script.js file
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggle-settings');
  const settingsBox = document.querySelector('.settings-box');
  
  toggleBtn.addEventListener('click', function() {
    console.log("Toggle button clicked");
      settingsBox.classList.toggle('collapsed');
  });
});