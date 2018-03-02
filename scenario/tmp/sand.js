const { Chromeless } = require('chromeless');



async function run() {
    try {
    let chromeless = new Chromeless({scrollBeforeClick: true});
    let h1 = await chromeless.goto('https://duckduckgo.com').html();
    console.log('ok');

    let selector = '#pg-index > div > div.badge-link.badge-link--top.badge-link--fadein.ddg-extension-hide.js-badge-link > div.badge-link__wrap.js-badge-main-msg > span';
    await chromeless.click(selector).html();

    let h2 = await chromeless.type('github chromeless', '#search_form_input_homepage').html();
    console.log('ok');
    let h2b = await chromeless.wait('#search_button_homepage').html();
    console.log('ok');
    let h3 = await chromeless.click('#search_button_homepage').html();
    console.log('ok');
    let h4 = await chromeless.wait('#r1-0 a.result__a').html();
    console.log('ok');
    } catch(err) {
        console.log(JSON.stringify(err));
    }
}

run();
