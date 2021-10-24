let shoppingCart = [],productCounter = 0
const cardsPharmacy = document.getElementById("cardsPharmacy")
const cardsToy = document.getElementById("cardsToy")
const counterNav = document.getElementById("counterNav")
const total = document.getElementById("total")
const modalBody = document.getElementById("modalBody")
const emptyScButton = document.getElementById("emptySc")
const finishSc = document.getElementById("finishSc")
const toastGreencontent = `<p class='d-flex align-items-center justify-content-around fs-5 px-3 text-white'><svg xmlns="http://www.w3.org/2000/svg"  fill="currentColor" class="bi bi-check-circle-fill show text-white" viewBox="0 0 16 16">
<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
</svg> </p> `
const toastRedContent = `<p class='d-flex align-items-center justify-content-around fs-5 px-3 text-white'><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-x-circle-fill show text-white" viewBox="0 0 16 16">
<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
</svg> </p> `

async function getApi() {
  let api = await fetch("https://apipetshop.herokuapp.com/api/articulos")
  let data = await api.json()
  arrayProducts = data.response
  copyArrayProducts = JSON.parse(JSON.stringify(arrayProducts))

  copyArrayProducts = arrayProducts.map((product) => {
    return { ...product, quantityToShow: 0 }
  })

  if (
    localStorage.getItem("shoppingCart") &&
    localStorage.getItem("copyArrayProducts")
  ) {
    shoppingCart = JSON.parse(localStorage.getItem("shoppingCart"))
    copyArrayProducts = JSON.parse(localStorage.getItem("copyArrayProducts"))
  }
  choosePageOfProducts()
  renderCardToModal()
  showTotalInModal(shoppingCart)
  counterNav.textContent = shoppingCart.length
}
getApi()

//save storage
function saveScStorage() {
  if (shoppingCart.length === 0) {
    localStorage.removeItem("shoppingCart")
  } else {
    localStorage.setItem("shoppingCart", JSON.stringify(shoppingCart))
    localStorage.setItem("copyArrayProducts", JSON.stringify(copyArrayProducts))
  }
}

//Filter original Array
function filterArrayProducts(array, type) {
  return array.filter((product) => product.tipo === type)
}

//Show products on page
function choosePageOfProducts() {
  if (cardsPharmacy) {
    drawTableProductsSelected(
      filterArrayProducts(copyArrayProducts, "Medicamento"),
      cardsPharmacy
    )
  } else if (cardsToy) {
    drawTableProductsSelected(
      filterArrayProducts(copyArrayProducts, "Juguete"),
      cardsToy
    )
  }
}

//Draw table with events of buttons
function drawTableProductsSelected(array, id) {
  array.forEach((product) => {
    let newDiv = document.createElement("div")
    newDiv.classList.add("text-center")
    newDiv.innerHTML = `
                <div class="card my-3 shadow rounded" style="width: 17rem;">
                    <div id='img${product._id}' class='altImg'>
                        <img  class="card-img-top d-block" src='${product.imagen}' alt="${product.nombre}">
                    </div>
                    <div class="altDesc" id="text${product._id}">
                        <p>${product.descripcion}</p>
                    </div>
                    <div class="card-body">
                        <p class="altText" >${product.nombre}</p>
                        <h3 class="pt-3">$ ${product.precio}</h3>
                        <p class='${
                          product.stock < 6 ? "bg-danger" : ""} text-white altText'> ${
                          product.stock < 6 ? "Ultimas unidades!!!" : ""}</p>
                        <p class="card-text text-decoration-underline cursor" id='desc${
                          product._id
                        }'>Ver descripción </p>
                        <button id="${product._id}" class="btn btn-danger bg-gradient">Añadir</button>
                    </div>
                </div>`
    id.appendChild(newDiv)

    //text to show and hide decription
    document
      .getElementById(`desc${product._id}`)
      .addEventListener("click", function showDescription() {
        let image = document.getElementById(`img${product._id}`)
        let textView = document.getElementById(`desc${product._id}`)
        let descripText = document.getElementById(`text${product._id}`)
        descripText.classList.add("d-flex", "align-items-center")

        if (descripText.style.display == "block") {
          image.style.display = "block"
          descripText.classList.remove("d-flex", "align-items-center")
          descripText.style.display = "none"
          textView.innerText = "Ver descripción"
        } else {
          image.style.display = "none"
          descripText.style.display = "block"
          textView.innerText = "Volver a la imagen"
        }
      })
    //Event in 'Añadir' button
    document.getElementById(`${product._id}`).addEventListener("click", (e) => {
      e.preventDefault()

      //push to shopping cart global
      arrayProducts.forEach((pro) => {
        if (
          product._id == pro._id &&
          product.stock > 0 &&
          product.quantityToShow < pro.stock
        ) {
          shoppingCart.push(product)
          product.stock--
          product.quantityToShow++
          renderCardToModal(shoppingCart)
          showTotalInModal(shoppingCart)
          //localStorage.setItem('shoppingCart',JSON.stringify(shoppingCart))
          addToast("toastGreen", toastGreencontent, "Agregaste producto !")
          saveScStorage()
        }
      })
      //count in NAV
      counterNav.textContent = shoppingCart.length
    })
  })
  counterNav.textContent =
    shoppingCart.length == 0 || shoppingCart.length == undefined
      ? 0
      : shoppingCart.length
}

//Function to render Modal
function renderCardToModal() {
  if (shoppingCart.length === 0) {
    modalBody.textContent = "El carrito esta vacio"
  } else {
    const noRepeatArr = shoppingCart.filter((value, index) => {
      return shoppingCart.indexOf(value) === index
    })
    modalBody.innerHTML = ""

    noRepeatArr.forEach((prod) => {
      let div = document.createElement("div")
      div.innerHTML = ` <div class="card mb-3 shadow rounded" style="max-width: 35rem;">
                                <div class="row g-0">
                                    <div class="col-sm-4 align-self-center">
                                        <img src="${prod.imagen}" class="img-fluid rounded-start" alt="${prod.nombre}">
                                    </div>
                                    <div class="col-sm-8">
                                        <div class="card-body">
                                            <div class=" d-flex justify-content-end my-1">
                                                <button type="button" name="action${prod._id}" data-action="deleteUnit" class="btn-close" aria-label="Close"></button>
                                            </div>
                                            <h5 class="card-title text-center">${prod.nombre}</h5>
                                            <p class="card-text text-center fs-5">$${prod.precio}</p>
                                            <div class="d-flex justify-content-center">
                                                <ul class="pagination">
                                                    <li><a class="btn btn-danger" name="action${prod._id}" data-action="less">-</a></li>
                                                    <li class="page-item mx-3 fs-4" id="count${prod._id}">${prod.quantityToShow}</li>
                                                    <li><a class="btn btn-danger" name="action${prod._id}" data-action="more">+</a></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`
      modalBody.appendChild(div)
      let actionButtons = document.getElementsByName(`action${prod._id}`)

      actionButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          if (e.target.dataset.action == "more") {
            arrayProducts.forEach((pro) => {
              if (pro._id == prod._id && prod.quantityToShow < pro.stock) {
                prod.quantityToShow++
                shoppingCart.push(prod)
                counterNav.textContent = shoppingCart.length
                showTotalInModal(shoppingCart)
                renderCardToModal(shoppingCart)
                saveScStorage()
                addToast(
                  "toastGreen",
                  toastGreencontent,
                  "Agregaste producto !"
                )
              }
            })
          } else if (e.target.dataset.action == "less") {
            let i = shoppingCart.indexOf(prod)
            arrayProducts.forEach((pro) => {
              if (pro._id == prod._id) {
                prod.stock++
                prod.quantityToShow--
                shoppingCart.splice(i, 1)
                counterNav.textContent = shoppingCart.length
                showTotalInModal(shoppingCart)
                renderCardToModal(shoppingCart)
                saveScStorage()
                addToast(
                  "toastRed",
                  toastRedContent,
                  "Eliminaste un producto !"
                )
              }
            })
          } else if (e.target.dataset.action == "deleteUnit") {
            arrayProducts.forEach((pro) => {
              if (pro._id == prod._id) {
                shoppingCart = shoppingCart.filter(
                  (product) => product._id !== prod._id
                )
                counterNav.textContent = shoppingCart.length
                showTotalInModal(shoppingCart)
                renderCardToModal(shoppingCart)
                prod.quantityToShow = 0
                prod.stock = pro.stock
                addToast(
                  "toastRed",
                  toastRedContent,
                  "Eliminaste el producto !"
                )
              }
            })
          }
        })
      })
    })
  }
}

//Add toast
function addToast(id, content, text) {
  let identifier = document.getElementById(id)

  identifier.className = "show"
  identifier.innerHTML = content
  identifier.classList.add("py-2", "px-3", "text-white")
  identifier.textContent = text

  setTimeout(function () {
    identifier.className = identifier.className.replace("show", "")
  }, 3000)
}

//Empty Shopping Cart
function emptyAllScInModal(id) {
  shoppingCart = []
  modalBody.innerHTML = ""
  counterNav.textContent = 0
  total.textContent = 0
  localStorage.clear()
  renderCardToModal(shoppingCart)
  copyArrayProducts.map((product) => {
    let element = arrayProducts.find((prod) => prod._id == product._id)
    product.stock = element.stock
    product.quantityToShow = 0
    return { ...product }
  })

  if (id === "toastRed") {
    addToast(id, toastRedContent, "Vaciaste carrito!")
  } else {
    addToast(id, toastGreencontent, "Finalizaste tu compra!")
  }
}

function showTotalInModal(array) {
  if (array.length == 0) {
    total.textContent = 0
  } else {
    return (total.textContent = array
      .map((prod) => prod.precio)
      .reduce((acc, value) => acc + value))
  }
}

function validateForm() {
  const name = document.getElementById("validationDefault01")
  const lastName = document.getElementById("validationDefault02")
  const invalidCheck2 = document.getElementById("invalidCheck2")
  let error = [], success = []
  name.value
    .split("")
    .forEach((letra) =>
      parseInt(letra) >= 0 && parseInt(letra) <= 9 ? error.push(letra) : false
    )
  lastName.value
    .split("")
    .forEach((letra) =>
      parseInt(letra) >= 0 && parseInt(letra) <= 9 ? error.push(letra) : false
    )
  if (error.length > 0)alert(`evita poner en nombre/apellido lo siguiente:${error.join(",")} ...`)

  var form = document.getElementsByName("formSubmit")
    form.forEach((input) =>input.value.length === 0 ? null : success.push(input.value))
  
  if (success.length === form.length && invalidCheck2.checked) {
    addToast("toastGreen", toastGreencontent, "Finalizaste compra!")
    form.forEach((input) => (input.value = null))
    invalidCheck2.checked = false
  } else {
    addToast("toastRed", toastRedContent, "Completa todos los campos!")
  }
}
