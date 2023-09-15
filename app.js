require('dotenv').config()

const express = require('express')
const app = express()
//const articles = [{title: 'Example 1'}, {title: 'Example 2'}, {title: 'Example 3'}]
const Article = require('./db').Article
const bodyParser = require('body-parser')
const read = require('node-readability')
const morgan = require('morgan');

app.set('port', process.env.PORT || 3001)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded( { extended: true } ))
app.use('/css/bootstrap.css', express.static('node_modules/bootstrap/dist/css/bootstrap.css'))
app.use("../styles/style.css", express.static('styles/style.css'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

function showAll (res, next) {
    Article.all((err, articles) => {
        if (err) return next(err)
        res.format({
            html: () => {
                console.log("Перед рендером всех: " + articles)
                res.render('articles.ejs', {amount: 'all', articles: articles})
            },
            json: () => {
                res.send(articles)
            }
        })
    })
}

app.get('/articles', (req, res, next) => {
    showAll(res, next);
})

app.get('/show-feature-2', (req, res, next) => {
    Article.findByAttribute('заказное', (err, articles) => {
        if (err) return next(err)
        res.format({
            html: () => {
                if (Array.isArray(articles)) { res.render('articles.ejs', {amount: 'several', articles: articles}) }
                else { res.render('articles.ejs', {amount: 'one', articles: articles}) }
            },
            json: () => {
                res.send(articles)
            }
        })
    })
})

app.post('/show-feature', (req, res, next) => {
    Article.findByDate(req.body.feature, (err, articles) => {
        if (err) return next(err)
        res.format({
            html: () => {
                if (Array.isArray(articles)) { res.render('articles.ejs', {amount: 'several', articles: articles}) }
                else { res.render('articles.ejs', {amount: 'one', articles: articles}) }
            },
            json: () => {
                res.send(articles)
            }
        })
    })
})

app.post('/articles', (req, res, next) => {
    Article.create(
        {title: req.body.title, content: req.body.content, date: req.body.date, attribute: req.body.attribute},
        (err, article) => {
            if (err) return next(err)
            // res.send('ok')
        }
    )

    showAll(res, next);

    // const url = req.body.url
    // read(url, (err, result) => {
    //     if(err || !result) res.status(500).send('Error downloading article')
    //     Article.create(
    //         {title: result.title, content: result.content},
    //         (err, article) => {
    //             if(err) return next(err)
    //             res.send('ok')
    //         }
    //     )
    // })

    // const article = { title: req.body.title }
    // articles.push(article)
    // res.send(article)
})

app.get('/articles/:id', (req, res, next) => {
    const id = req.params.id
    Article.find(id, (err, articles) => {
        if (err) return next(err)
        res.format({
            html: () => {
                res.render('articles.ejs', {amount: 'one', articles: articles})
            },
            json: () => {
                res.send(articles)
            }
        })
    })
})

app.delete('/articles/:id', (req, res, next) => {
    const id = req.params.id
    Article.delete(id, (err) => {
        if (err) return next(err)
    })

    showAll(res, next);
})

app.listen(app.get('port'), () => {
    console.log(`Web app available at http://127.0.0.1:${app.get('port')}/articles`)
})

module.exports = app