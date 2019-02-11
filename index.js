if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

morgan.token('content', 
  function (request) {
    if(JSON.stringify(request.body) === '{}') {
      return ''
    }
    return JSON.stringify(request.body)
  }
)

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (body.name === undefined ||body.number === undefined) {
    return response.status(400).json({ error: 'name or number missing' })
  }
  const person = new Person({
    name: body.name,
    number: body.number
  })
  
  person.save()
    .then(savedPerson => {
      response.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  // eslint-disable-next-line no-console
  console.error(error.message)

  if(error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformed id'})
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

let persons = [
  {
    id: 1,
    name: 'Allu Aamuinen',
    number: '040-1234567'
  },
  {
    id: 2,
    name: 'Ville Vilkas',
    number: '050-1234567'
  },
  {
    id: 3,
    name: 'Teemu Touhukas',
    number: '040-1212121'
  }
]

app.get('/api/persons', (request,response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  
  const person = {
    name: body.name,
    number: body.number
  }

  Person.findOneAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})


app.get('/info', (request, response) => {
  response.send(
    '<div>'+
      '<p>Puhelinluettelossa on '+persons.length+' henkilön tiedot</p>'+
      '<p>'+new Date()+'</p>'+
    '</div>'
  )
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})