const productList = document.querySelector('#products');
const addProductForm = document.querySelector('#add-product-form');
const updateProductForm = document.querySelector('#update-product-form');
const updateProductId = document.querySelector('#update-id');
const updateProductName = document.querySelector('#update-name');
const updateProductDescription = document.querySelector('#update-description');
const updateProductPrice = document.querySelector('#update-price');
const cancelUpdateButton = document.querySelector('#cancel-update');

function showUpdateForm(product) {
  updateProductId.value = product.id;
  updateProductName.value = product.name;
  updateProductDescription.value = product.description || '';
  updateProductPrice.value = product.price;
  updateProductForm.style.display = 'block';
}
window.showUpdateForm = showUpdateForm;

function hideUpdateForm() {
  updateProductForm.style.display = 'none';
  updateProductForm.reset();
}
window.hideUpdateForm = hideUpdateForm;

async function fetchProducts() {
  try {
    const response = await fetch('http://localhost:3000/products');
    const products = await response.json();

    productList.innerHTML = '';

    products.forEach(product => {
      const li = document.createElement('li');
      const descText = product.description ? ` | Desc: ${product.description}` : '';
      li.innerHTML = `<strong>ID:</strong> ${product.id} - <strong>${product.name}</strong>${descText} - $${product.price} `;

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'btn-delete';
      deleteButton.innerHTML = 'Delete';
      deleteButton.onclick = async function() {
        await deleteProduct(product.id);
        await fetchProducts();
      };
      li.appendChild(deleteButton);

      const updateButton = document.createElement('button');
      updateButton.type = 'button';
      updateButton.className = 'btn-edit-list';
      updateButton.innerHTML = 'Update';
      updateButton.onclick = function() {
        showUpdateForm(product);
      };
      li.appendChild(updateButton);

      productList.appendChild(li);
    });
  } catch (error) {
    console.error(error);
  }
}
window.fetchProducts = fetchProducts;

function clearSearch() {
  document.getElementById('search-id').value = '';
  document.getElementById('search-result').innerHTML = '';
  fetchProducts();
}
window.clearSearch = clearSearch;

async function searchProductById() {
  const id = document.getElementById('search-id').value;
  const resultDiv = document.getElementById('search-result');
  
  if (!id) {
    resultDiv.innerHTML = '<p class="error-msg">Por favor, insira um ID válido.</p>';
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/products/${id}`);
    const data = await response.json();

    if (!data || data.length === 0) {
      resultDiv.innerHTML = `<p class="error-msg">Produto com ID ${id} não encontrado.</p>`;
      return;
    }

    const product = data[0];
    const descText = product.description ? `<p><strong>Descrição:</strong> ${product.description}</p>` : '<p><strong>Descrição:</strong> Sem descrição</p>';
    
    resultDiv.innerHTML = `
      <div class="search-item">
        <h3>Produto Encontrado:</h3>
        <p><strong>ID:</strong> ${product.id}</p>
        <p><strong>Nome:</strong> ${product.name}</p>
        ${descText}
        <p><strong>Preço:</strong> $${product.price}</p>
      </div>
    `;
  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = '<p class="error-msg">Erro ao buscar o produto.</p>';
  }
}
window.searchProductById = searchProductById;

addProductForm.onsubmit = async function(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const description = document.getElementById('description').value;
  const price = document.getElementById('price').value;
  
  const res = await addProduct(name, description, price);
  if (res && !res.error) {
    addProductForm.reset();
    await fetchProducts();
  }
};

updateProductForm.onsubmit = async function(event) {
  event.preventDefault();
  const id = updateProductId.value;
  const name = updateProductName.value;
  const description = updateProductDescription.value;
  const price = updateProductPrice.value;
  
  const res = await updateProduct(id, name, description, price);
  if (res && !res.error) {
    hideUpdateForm();
    await fetchProducts();
  }
};

cancelUpdateButton.onclick = function() {
  hideUpdateForm();
};

// Aqui o segredo: enviamos os dados pro Back-end SEM o ID.
async function addProduct(name, description, price) {
  try {
    const response = await fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price })
    });
    const data = await response.json();
    if (data.error) alert('Erro ao adicionar: ' + data.error);
    return data;
  } catch (err) {
    alert('Erro de conexão no Add');
  }
}

async function updateProduct(id, name, description, price) {
  try {
    const response = await fetch('http://localhost:3000/products/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price })
    });
    const data = await response.json();
    if (data.error) alert('Erro ao atualizar: ' + data.error);
    return data;
  } catch (err) {
    alert('Erro de conexão no Update');
  }
}

async function deleteProduct(id) {
  const response = await fetch('http://localhost:3000/products/' + id, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

fetchProducts();