const { response } = require('express');
// const User = require('../models/user');
const bcrypt = require('bcryptjs');
const puppeteer = require('puppeteer');

const search = async (req, res = response) => {
    const filter = req.query.product || '';
    const currentpage = req.query.currentpage || 1;
    try {
        const url = `https://www.homecenter.com.co/homecenter-co/search?Ntt=${encodeURIComponent(filter + ' ')}&currentpage=${currentpage}`;
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector('.product-wrapper');
        const products = await page.$$eval('.product-wrapper', (elements) => {
            return elements.map((element) => {
                const titleElement = element.querySelector('.product-title');
                const title = titleElement ? titleElement.textContent.trim() : '';
                const imageElement = element.querySelector('.product-image .image-contain');
                const image = imageElement.src;
                const priceElement = element.querySelector('.price span');
                const price = priceElement ? priceElement.textContent.trim() : '';
                const brandElement = element.querySelector('.product-brand');
                const brand = brandElement ? brandElement.textContent.trim() : '';
                return { title, image, price, brand };
            });
        });
        await page.waitForSelector('.page-indicies:first-child');
        const numberPages = await page.$$eval('.page-indicies:first-child', (elements) => {
            const liElements = elements[0].querySelectorAll('.page-item');
            const lastLiElement = liElements[liElements.length - 1];
            const lastButtonText = lastLiElement.querySelector('button').textContent.trim();
            return lastButtonText;
        });
        await browser.close();
        res.status(200).json({
            ok:true,
            numberPages,
            products
        });
    } catch (error) {
        message(500,'Error inesperado comuniquese con el administrador',res);
    }
}


const message = (code,text,res) => {
    res.status(code).json({
        ok:false,
        message:text
    });
}

module.exports = {
    search
}
