function updatePreview() {
  const icon = document.getElementById('icon').value;
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const label = document.getElementById('label').value;
  const amountOptions = document.getElementById('amount_options').value.split(',');
  
  const previewIcon = document.getElementById('preview-icon');
  const previewTitle = document.getElementById('preview-title');
  const previewDescription = document.getElementById('preview-description');
  const previewLabel = document.getElementById('preview-label');
  const previewAmounts = document.getElementById('preview-amounts');
  const customAmount = document.getElementById('custom-amount');

  if (icon) {
      previewIcon.src = icon;
      previewIcon.style.display = 'block';
  } else {
      previewIcon.style.display = 'none';
  }

  if (title) {
      previewTitle.textContent = title;
      previewTitle.style.display = 'block';
  } else {
      previewTitle.style.display = 'none';
  }

  if (description) {
      previewDescription.textContent = description;
      previewDescription.style.display = 'block';
  } else {
      previewDescription.style.display = 'none';
  }

  if (label) {
      previewLabel.textContent = label;
      previewLabel.style.display = 'block';
  } else {
      previewLabel.style.display = 'none';
  }

  previewAmounts.innerHTML = '';
  if (amountOptions.length > 0 && amountOptions[0] !== "") {
      amountOptions.forEach(amount => {
          const button = document.createElement('button');
          button.textContent = amount.trim() + ' SOL';
          previewAmounts.appendChild(button);
      });
      previewAmounts.style.display = 'block';
      customAmount.style.display = 'flex';
  } else {
      previewAmounts.style.display = 'none';
      customAmount.style.display = 'none';
  }
}

function generateLink() {
  const icon = document.getElementById('icon').value;
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const label = document.getElementById('label').value;
  const amountOptions = document.getElementById('amount_options').value.split(',').map(amount => amount.trim());
  const address = document.getElementById('address').value;

  let isValid = true;

  if (!icon) {
      document.getElementById('icon-error').style.display = 'block';
      isValid = false;
  } else {
      document.getElementById('icon-error').style.display = 'none';
  }

  if (!title) {
      document.getElementById('title-error').style.display = 'block';
      isValid = false;
  } else {
      document.getElementById('title-error').style.display = 'none';
  }

  if (!description) {
      document.getElementById('description-error').style.display = 'block';
      isValid = false;
  } else {
      document.getElementById('description-error').style.display = 'none';
  }

  if (!label) {
      document.getElementById('label-error').style.display = 'block';
      isValid = false;
  } else {
      document.getElementById('label-error').style.display = 'none';
  }

  if (!amountOptions[0]) {
      document.getElementById('amount-options-error').style.display = 'block';
      isValid = false;
  } else {
      document.getElementById('amount-options-error').style.display = 'none';
  }

  if (!address) {
      document.getElementById('address-error').style.display = 'block';
      isValid = false;
  } else {
      document.getElementById('address-error').style.display = 'none';
  }

  if (isValid) {
      const data = {
          icon,
          label,
          title,
          description,
          amount_options: amountOptions,
          address
      };

      const jsonString = JSON.stringify(data);
      const base64String = btoa(jsonString);
      const linkPath = `/donate/${base64String}`;
      window.location = linkPath;
  }
}
