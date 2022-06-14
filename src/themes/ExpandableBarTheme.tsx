import { BaseTheme } from './BaseTheme'
import { Theme } from './index'

export const ExpandableBarTheme = (theme: Theme) => `
  .feedbot-reset {
    all: revert
  }

  .feedbot-reset * {
    all: revert
  }

  .feedbot-header {
      z-index: 10;
      color: white;
      line-height: 30px;
      padding: 9px 8px 8px 16px;
      cursor: pointer;
      font-size: 1.1em;
      letter-spacing: 1px;
      display: flex;
      font-family: 'Roboto', sans-serif;
  }

  .feedbot-header .feedbot-title {
      flex-grow: 1;
  }

  .feedbot-header .feedbot-minimize {
      width: 30px;
      text-align: center;
      color: white;
      font-weight: bolder;
      font-family: Verdana;
      font-size: 1.2em;
      line-height: 0.9em;
  }

  .feedbot-wrapper.collapsed .feedbot-minimize {
      display: none;
  }

  .feedbot-header .feedbot-minimize:hover {
      font-size: 1.5em;
      line-height: 0.8em;
  }

  .feedbot-header, .feedbot-wrapper {
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
  }

  .feedbot-wrapper {
    background-color: #fff;
    width: 450px;
    min-width: 275px;
    max-width: 90%;
    height: 700px;
    max-height: 90%;
    position: fixed;
    right: 5%;
    bottom: 0px;
    z-index: 100000;

    -webkit-box-shadow: 0px 0px 10px 0px rgba(167, 167, 167, 0.35);
    -moz-box-shadow: 0px 0px 10px 0px rgba(167, 167, 167, 0.35);
    box-shadow: 0px 0px 10px 0px rgba(167, 167, 167, 0.5);
  }

  .feedbot-wrapper.collapsed > .feedbot {
      display: none;
  }

  .feedbot-wrapper.collapsed {
      height: auto;
  }

  .feedbot-wrapper.collapsed .feedbot-header {
      padding-top: 10px;
  }

  .feedbot-wrapper .wc-adaptive-card, .feedbot-wrapper .wc-card {
    max-width: 337px !important;
  }

  ${BaseTheme(theme)}

  .wc-carousel .wc-hscroll > ul > li > .wc-card {
    height: 100%;
  }

  .wc-carousel .wc-hscroll > ul > li > .wc-card > div > .ac-container > .ac-container .ac-image{
    border-radius: 5px 5px 0 0;
  }
`
