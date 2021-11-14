const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const { response } = require('express')
const compression = require('compression')

const PORT = 8000

//Express application object
const app = express()

//Compressing all routes
app.use(compression())

const newspapers = [
  {
    name: 'skynews',
    address: 'https://news.sky.com/climate',
    base: 'https://news.sky.com/',
  },
  {
    name: 'aljazeera',
    address: 'https://www.aljazeera.com/tag/climate/',
    base: 'https://www.aljazeera.com/'
  },
  {
    name: 'thetimes',
    address: 'https://www.thetimes.co.uk/environment/climate-change',
    base: '',
  },
  {
    name: 'guardian',
    address: 'https://www.theguardian.com/environment/climate-crisis',
    base: '',
  },
  {
    name: 'telegragh',
    address: 'https://www.telegraph.co.uk/climate-change/',
    base: 'https://www.telegraph.co.uk',
  },
  {
    name: 'insideclimatenews',
    address: 'https://insideclimatenews.org/todaysclimate/',
    base: 'https://insideclimatenews.org/',
  },
  {
    name: 'climatechangenews',
    address: 'https://www.climatechangenews.com/news/',
    base: 'https://www.climatechangenews.com/news/',
  },
  {
    name: 'dailyclimate',
    address: 'https://www.dailyclimate.org/',
    base: 'https://www.dailyclimate.org/',
  },
  {
    name: 'bbc',
    address: 'https://www.bbc.com/news/science-environment-56837908',
    base: 'https://www.bbc.com/news/',
  }
]

const articles = []

newspapers.forEach((newspaper) => {
  axios.get(newspaper.address).then((response) => {
    const html = response.data
    const $ = cheerio.load(html)

    $('a:contains("climate")', html).each(function () {
      const title = $(this).text()
      const url = $(this).attr('href')

      articles.push({
        title,
        url: newspaper.base + url,
        source: newspaper.name,
      })
    })
  })
})

app.get('/', (req, res) => {
  res.json('Climate News API')
})

app.get('/climate', (req, res) => {
  res.json(articles)
})

app.get('/climate/:newspaperId', async (req, res) => {
  const newspaperId = req.params.newspaperId

  const newspaperAddress = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId,
  )[0].address

  const newspaperBase = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId,
  )[0].base

  axios
    .get(newspaperAddress)
    .then((response) => {
      const html = response.data
      const $ = cheerio.load(html)

      const specificArticles = []

      $('a:contains("climate")', html).each(function () {
        const title = $(this).text()
        const url = $(this).attr('href')
        specificArticles.push({
          title,
          url: newspaperBase + url,
          source: newspaperId,
        })
      })
      res.json(specificArticles)
    })
    .catch((err) => console.log(err))
})

app.listen(PORT, () => console.log('server running on PORT:' + PORT))