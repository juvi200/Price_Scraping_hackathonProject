const puppeteer =require("puppeteer");//install
const cheerio=require("cheerio");
let body=require('body');
const $ = cheerio.load(body);//install
const CronJob=require("cron").CronJob;//install
const nodemailer=require("nodemailer");//install

const url="https://www.amazon.in/Test-Exclusive_2020_1176-Multi-3GB-Storage/dp/B089MV1ZSM/ref=sxin_5?cv_ct_cx=oneplus&dchild=1&keywords=one+plus&pd_rd_i=B089MV1ZSM&pd_rd_r=865bfc5e-b4ac-4284-9907-da4f979a2379&pd_rd_w=ZW239&pd_rd_wg=yTvO6&pf_rd_p=ae9b0140-51da-4535-981a-ac0cd9862771&pf_rd_r=FQCW5SG5YMSQSBPASMV9&qid=1635072167&sr=1-1-a35f83b1-e4de-468c-ba51-205d3aeba966";

async function  funbrowser()
{
    const browser=await puppeteer.launch({
        headless: false
    });
const page=await browser.newPage();
await page.setDefaultNavigationTimeout(0);
await page.goto(url);
return page;

}

//function to check price which will be revoked frequently
async function checkprice(page)
{
    await page.reload();
    //get html document
    let html=await page.evaluate(() => document.body.innerHTML);
    //console.log(html);

    $('#priceblock_dealprice',html).each(function() {
        let price=$(this).text();//here we will get price
        //console.log(price);
        //remove R from  price 
        let currentPrice=Number(price.replace(/[^0-9.-]+/g,""));
        //console.log(currentPrice);
        if(currentPrice<47000)
        {
            //console.log("You can now BUY!!!"+currentPrice);
            sendNotification(currentPrice);
        }

    });

}


//function to track from browser which checks every 15 sec the price
async function startTracking()
{
    let page=await funbrowser();
    let job=new CronJob('* */15 * * * * ',function()
    {
        //runs function every 10 sec in this browser

        checkprice(page);

    },null,true,null,null,true);
    job.start();
}

//function to send notification
async function sendNotification(price)
{
    let transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'********@gmail.com',
            pass:'********'
        }
    });

    let textToSend='Price dropped to'+price;
   let htmlText = `<a href=\"${url}\">Link</a>`;
  
let info=await transporter.sendMail({
    from:'"Price Tracker"<juvishaikh256@gmail.com>',
    to:"********@gmail.com",
    subject:'price dropped to '+price,
    text: textToSend,
    html:htmlText

    });
    console.log("Message sent:%S",info.messageId);

}

startTracking();