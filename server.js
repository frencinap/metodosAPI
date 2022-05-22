const express = require('express')
const joyas = require('./data/joyas.js')
const app = express()
app.listen(3000, () => console.log('Your app listening on http://localhost:3000'))

app.use(express.static('public'))

const HATEOASV1 = (category = null) => {
  if(!category){
    return joyas.map( joya => {
      return {
        name : joya.name,
        url: `http://localhost:3000/joyas/${joya.id}`
      }
    })
  }else{
    return joyas.filter( j => j.category == category)
  }
}

//ruta principal v1
app.get('/joyas', (req,res)=>{
  res.send(HATEOASV1());
})

//detalle de cada joya
const joya = (id) => {
  return joyas.find(joya => id == joya.id)
}

//funcion atributos
const atributos = (joya, campos) => {
  campos = campos.split(',');
  let retorno = {};
  for (const key in joya) {
    if(campos.includes(key)){
      retorno[key] = joya[key]
    }
  }
  return retorno
}

//detalle de joya y filtro por campos
app.get('/joyas/:id', (req,res)=>{
  const id = req.params.id;
  const campos = req.query.campos
  if(!campos){
    res.send(joya(id));
  } else{
    //joyas/:id?campos=stock,value, etc
    res.send(atributos(joya(id), campos))
  }
  
})

//V2 API
const HATEOASV2 = () => {
  return joyas.map( joya => {
    return{
      identificador: joya.id,
      nombre: joya.name,
      modelo: joya.model,
      categoria: joya.category,
      material: joya.metal,
      largo: joya.cadena,
      talla: joya.medida,
      valor: joya.value,
      cantidad: joya.stock
    }
  })
}

//función que ordena por value
const order = (parametro) => {
  if(parametro == 'asc'){
    return joyas.sort((a,b) => a.value > b.value ? 1 : -1)
  } else{
    return joyas.sort((a,b) => a.value < b.value ? 1 : -1)
  }
}

//v2 api, orden asc y desc y paginacion
app.get('/v2/joyas', (req,res)=>{
  if(req.query.value){
    // v2/joyas?value=asc || v2/joyas?value=desc
    return res.send(order(req.query.value))
  }

  if(req.query.page){
    let page = req.query.page
    //v2/joyas?page=1 || v2/joyas/page=2
    return res.send(HATEOASV2().slice((page * 3 - 3), (page * 3)))
  }
  
  res.send(HATEOASV2())
});

//filtro por categoria
app.get('/v2/joyas/category/:category', (req,res) =>{
  const category = req.params.category;
  res.send(HATEOASV1(category))
})


