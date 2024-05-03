const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");

const app = express();
const port = 3000;

const url = 'https://es.wikipedia.org';

app.get('/', (req, res) => {
    axios.get(url + '/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap').then((response) => {
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);
            const pageTitle = $('title').text();
            const links = [];
            $('#mw-pages a').each((index, element) => {
                const link = $(element).attr('href');
                links.push(link);
            });
            const information = [];

            const getPageInfo = async (link) => {
                try {
                    const response = await axios.get(url + link);
                    if (response.status === 200) {
                        const html = response.data;
                        const $ = cheerio.load(html);
                        const title = $('title').text();
                        const images = [];
                        $('img').each((index, element) => {
                            const img = $(element).attr('src');
                            images.push(img);
                        });
                        const text = [];
                        $('p').each((index, element) => {
                            const p = $(element).text();
                            text.push(p);
                        });
                        const pageInfo = {
                            title: title,
                            images: images,
                            text: text
                        };
                        information.push(pageInfo);
                    }
                } catch (error) {
                    console.error(error);
                }
            };

            const promises = links.map(link => getPageInfo(link));
            Promise.all(promises).then(() => {
                console.log("Information:", information);
                res.send(information);
            }).catch(error => {
                console.error("Error:", error);
                res.status(500).send("Internal Server Error");
            });
        }
    }).catch(error => {
        console.error("Error fetching main page:", error);
        res.status(500).send("Internal Server Error");
    });
});

app.listen(port, () => {
    console.log(`express is listening on port http://localhost:${port}`);
});
