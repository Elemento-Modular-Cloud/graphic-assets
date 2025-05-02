$(document).ready(function() {
  $('#maskSelector').on('change', function() {
    const maskFile = $(this).val();
    console.log(`[blur-mask] Mask selected: ${maskFile}`);

    // Remove any previous mask/clipPath SVG (if you still have this logic)
    $('svg#dynamicMask').remove();

    // Use the whole SVG as a mask image
    const maskUrl = `url("masks/${maskFile}")`;
    $('.blur-mask').attr('style', `mask-image: ${maskUrl}; -webkit-mask-image: ${maskUrl};`);
    console.log(`[blur-mask] Applied mask to .blur-mask using mask-image: ${maskUrl}`);
  });

  // Trigger change on load to apply the first mask
  console.log('[blur-mask] Triggering initial maskSelector change');
  $('#maskSelector').trigger('change');

  $('#image-upload').on('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Update the label text to show the selected file name
    $('.custom-file-label[for="image-upload"]').text(file.name);

    const reader = new FileReader();
    reader.onload = function(e) {
      $('.background-image').css('background-image', `url(${e.target.result})`);
    };
    reader.readAsDataURL(file);
  });
});
