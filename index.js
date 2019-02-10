const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())

app.use(express.static('build'))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

morgan.token('content', 
  function (req, res) {
    if(JSON.stringify(req.body) === '{}') {
      return ""
    }
    return JSON.stringify(req.body)
  }
)

app.use(bodyParser.json())

let persons = [
  {
    id: 1,
    name: "Allu Aamuinen",
    number: "040-1234567"
  },
  {
    id: 2,
    name: "Ville Vilkas",
    number: "050-1234567"
  },
  {
    id: 3,
    name: "Teemu Touhukas",
    number: "040-1212121"
  }
]

app.get('/api/persons', (request,response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if(person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const person = request.body
  if (person.name && person.number || (person.name === "" || persons.number === "")) {
    var loytyy = false
    for(var i=0; i<persons.length; i++) {
      if(person.name === persons[i].name) {
        loytyy = true
        break
      }
    }
    if(loytyy) {
      response.status(409).json({error: 'Name must be unique'}).end()
    }
  } else {
    response.status(400).json({error: 'Person must have name and number'}).end()
  }
  console.log(person)
  person.id = Math.floor(Math.random()*Math.floor(200))
  response.json(person)
})

app.get('/info', (request, response) => {
  response.send(
    '<div>'+
      '<p>Puhelinluettelossa on '+persons.length+' henkilön tiedot</p>'+
      '<p>'+new Date()+'</p>'+
    '</div>'
  )
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})