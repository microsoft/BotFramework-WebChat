import * as dl from "../node_modules/botframework-directlinejs/built/directLine";
const config = require('./mock_dl_server_config');
const asset_url = "http://localhost:" + config["port"] + "/assets/";

var bot: dl.User = {
    id: "bot",
    name: "botname"
}

/*
 * Activity for Animation
 * 
 */
var ani_attach1: dl.AnimationCard = {
    contentType: "application/vnd.microsoft.card.animation",
    content: {
        title: "title",
        subtitle: "animation",
        text: "No buttons, No Image, Autoloop, Autostart, Sharable",
        media: [{ url: asset_url + "surface_anim.gif", profile: "animation" }],
        autoloop: true,
        autostart: true
    }
}

export var ani_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachments: [ani_attach1]
}

/*
 * Activity for Carousel
 * 
 */
var car_attach1: dl.HeroCard = {
    contentType: "application/vnd.microsoft.card.hero",
    content: {
        title: "Details about image 1",
        text: "Price: $XXX.XX USD",
        images: [
            {
                url: asset_url + "surface1.jpg",
            }
        ],
        buttons: [
            {
                type: "imBack",
                value: "Place to buy",
                title: "Places To Buy"
            },
            {
                type: "imBack",
                value: "Related Products",
                title: "Related Products"
            }
        ]
    }
}

var car_attach2: dl.HeroCard = {
    contentType: "application/vnd.microsoft.card.hero",
    content: {
        title: "Details about image 2",
        text: "Price: $XXX.XX USD",
        images: [
            {
                "url": asset_url + "surface2.jpg"
            }
        ],
        buttons: [
            {
                "type": "imBack",
                "value": "Place to buy",
                "title": "Places To Buy"
            },
            {
                "type": "imBack",
                "value": "Related Products",
                "title": "Related Products"
            }
        ]
    }
}

var car_attach3: dl.HeroCard = {
    contentType: "application/vnd.microsoft.card.hero",
    content: {
        title: "Details about image 3",
        text: "Price: $XXX.XX USD",
        images: [
            {
                "url": asset_url + "surface3.jpg"
            }
        ],
        buttons: [
            {
                "type": "imBack",
                "value": "Place to buy",
                "title": "Places To Buy"
            },
            {
                "type": "imBack",
                "value": "Related Products",
                "title": "Related Products"
            }
        ]
    }
}

var car_attach4: dl.HeroCard = {
    contentType: "application/vnd.microsoft.card.hero",
    content: {
        title: "Details about image 4",
        text: "Price: $XXX.XX USD",
        images: [
            {
                "url": asset_url + "surface4.jpg"
            }
        ],
        buttons: [
            {
                "type": "imBack",
                "value": "Place to buy",
                "title": "Places To Buy"
            },
            {
                "type": "imBack",
                "value": "Related Products",
                "title": "Related Products"
            }
        ]
    }
}

export var adaptive_cardsFn = function (json: any) {
    var acMessage: dl.Message = {
        type: "message",
        from: bot,
        timestamp: new Date().toUTCString(),
        channelId: "webchat",
        attachments: [
            { contentType: "application/vnd.microsoft.card.adaptive", content: json }
        ]
    };

    return acMessage;
}

export var car_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachmentLayout: "carousel",
    attachments: [car_attach1, car_attach2, car_attach3, car_attach4]
}

export var smallcar_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachmentLayout: "carousel",
    attachments: [car_attach1]
}

/*
 * Activity for Markdown
 * 
 */
export var mar_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    textFormat: "markdown",
    text: "## Basic formatting\r\n\r\nParagraphs can be written like so. A paragraph is the \r\nbasic block of Markdown. \r\nA paragraph is what text will turn \r\ninto when there is no reason it should become anything else.\r\n\r\nParagraphs must be separated by a blank line. Basic formatting of *italics* and **bold** is supported. This *can be **nested** like* so.\r\n\r\n#### Lists\r\n\r\n### Ordered list\r\n\r\n1. one\r\n2. two\r\n3. three\r\n4. four\r\n\r\n### Unordered list\r\n\r\n* An item\r\n* Another item\r\n* Yet another item\r\n* And there's more...\r\n\r\n## Paragraph modifiers\r\n\r\n### Code block\r\n\r\n```\r\nCode blocks are very useful for developers and other \r\npeople who look at code or other things that are written \r\nin plain text. As you can see, it uses a fixed-width font.\r\n```\r\n\r\nYou can also make `inline code` to add code into other things.\r\n\r\n### Quote\r\n\r\n> Here is a quote. What this is should be self explanatory. \r\n> Quotes are automatically indented when they are used.\r\n\r\n# h1\r\n## h2\r\n### h3\r\n#### h4\r\n\r\n### Headings *can* also contain **formatting**\r\n\r\n## URLs\r\n\r\nURLs can be made in a handful of ways:\r\n\r\n* A named link to [MarkItDown][3]. The easiest way to do these is to select what you want to make a link and hit `Ctrl+L`.\r\n* Another named link to [MarkItDown](http://www.markitdown.net/)\r\n* Sometimes you just want a URL like <http://www.markitdown.net/>.\r\n\r\n## Images\r\nThis is an image\r\n\r\n![Image of Yaktocat](https://octodex.github.com/images/yaktocat.png)\r\n\r\n\r\n## Horizontal rule\r\n\r\nA horizontal rule is a line that goes across the middle of the page.\r\n\r\n---\r\n\r\nIt's sometimes handy for breaking things up.\r\n\r\n\r\n## Table\r\n|header1|header 2|\r\n|----|----|\r\n| cell 1 | cell 2|\r\n| cell three | cell four|\r\n\r\n## Whitespace\r\n\r\nHere's a line.\r\n\r\nThis has the standard two newlines before it.\r\n\r\n\r\n\r\nThis has four newlines before it.\r\n\r\n\r\n\r\n\r\n\r\nThis has six newlines before it.\r\n\r\n<br/><br/><br/><br/>This has two newlines and four &lt;br/&gt; tags before it."
}


/*
 * Activity for SignIn
 * 
 */
var si_attach1: dl.Signin = {
    contentType: "application/vnd.microsoft.card.signin",
    content: {
        text: "Login to signin sample",
        buttons: [
            {
                type: "signin",
                title: "Signin",
                value: "https://login.live.com/"
            }
        ]
    }
}

export var si_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    attachments: [si_attach1]
}

/*
 * Activity for SuggestedActions
 * 
 */
export var suggested_actions_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    textFormat: "plain",
    text: "Message Text",
    suggestedActions: {
        actions: [
            {
                type: "imBack",
                title: "Blue",
                value: "Blue",
                image: asset_url + "square-icon.png"
            },
            {
                type: "imBack",
                title: "Red",
                value: "Red",
                image: asset_url + "square-icon-red.png"
            },
            {
                type: "imBack",
                title: "Green",
                value: "Green",
                image: asset_url + "square-icon-green.png"
            }
        ]
    }
}

var receipt_attach: dl.Receipt = {
    contentType: "application/vnd.microsoft.card.receipt",
    content: {
    title: "Rodrigez Bender Hotel Bill",
        items: [
            {
                title: "Hotel Bender (r) Paris.",
                subtitle: "$71 Today up to 27% off Booked in the last 2 hours",
                text: "Futurama. 40 Aliee De la Mare dian Houleuse, Magny-le-Hongre, Seine-Marne.",
                image: {
                    url: "https://testbot.botframework.com/media/hotel-bender.jpg"
                },
                price: "$71"
            },
            {
                title: "Label AAAA",
                price: "$140"
            },
            {
                title: "Label BBBB",
                price: "$110"
            }
        ],
        facts: [
            {
                key: "Order Number",
                value: "1234567890"
            },
            {
                key: "expected delivery time",
                value: "2016.06.15"
            },
            {
                key: "Payment Method",
                value: " VISA 0987"
            },
            {
                key: "Delivery Address",
                value: "Prague, Andel, 14700"
            }
        ],
        total: "$341.40",
        tax: "$20.40",
        buttons: [
            {
                type: "imBack",
                title: "Thumbs Up",
                value: "I like it"
            },
            {
                type: "imBack",
                title: "Thumbs Down",
                value: "I don't like it"
            }
        ]
    }
}

export var receipt_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachmentLayout: "carousel",
    attachments: [receipt_attach]
}