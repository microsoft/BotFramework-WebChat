/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript', () => {
  test('with activity grouping test 1', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=simple-messages.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 2', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=simple-messages.json&ui=1&un=1&ut=1&w=1&ch=1280&cw=720'
    ));

  test('with activity grouping test 3', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=1&t=simple-messages.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 4', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=sender&l=0&rtl=0&t=simple-messages.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 5', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=1&l=0&rtl=0&t=simple-messages.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 6', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=0&bn=1&bt=1&g=1&l=0&rtl=0&t=simple-messages.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 7', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=0&bn=0&bt=1&g=1&l=0&rtl=0&t=simple-messages.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 8', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=0&bn=1&bt=0&g=1&l=0&rtl=0&t=simple-messages.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 9', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=1&l=0&rtl=0&t=simple-messages.json&ui=0&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 10', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=1&l=0&rtl=0&t=simple-messages.json&ui=0&un=1&ut=0&w=0&ch=1280'
    ));

  test('with activity grouping test 11', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=0&bn=0&bt=1&g=1&l=0&rtl=0&t=simple-messages.json&ui=0&un=0&ut=0&w=0&ch=1280'
    ));

  test('with activity grouping test 12', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=0&bn=1&bt=1&g=1&l=0&rtl=0&t=simple-messages.json&ui=0&un=0&ut=0&w=0&ch=1280'
    ));

  test('with activity grouping test 13', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=carousel-layout.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 14', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=carousel-layout.json&ui=1&un=1&ut=1&w=1&ch=1280&cw=720'
    ));

  test('with activity grouping test 15', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=1&l=0&rtl=0&t=carousel-layout.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 16', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=carousel-layout.json&ui=0&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 17', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=carousel-layout.json&ui=0&un=0&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 18', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=0&g=status&l=0&rtl=0&t=carousel-layout.json&ui=0&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 19', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=0&g=status&l=stacked&rtl=0&t=carousel-layout.json&ui=0&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 20', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=multiple-lines-multiple-files.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 21', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=stacked&rtl=0&t=multiple-lines-multiple-files.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 22', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=0&bn=0&bt=1&g=status&l=stacked&rtl=0&t=multiple-lines-multiple-files.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 23', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=0&bn=0&bt=1&g=status&l=0&rtl=0&t=multiple-lines-multiple-files.json&ui=1&un=1&ut=1&w=1&ch=1280&cw=720'
    ));

  test('with activity grouping test 24', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=single-line-no-files.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 25', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=user-upload.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 26', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=user-upload.json&ui=1&un=1&ut=1&w=1&ch=1280&cw=720'
    ));

  test('with activity grouping test 27', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=user-upload.json&ui=1&un=1&ut=0&w=0&ch=1280'
    ));

  test('with activity grouping test 28', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=stacked&rtl=0&t=user-upload.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 29', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=1&l=0&rtl=0&t=multiple-lines-multiple-files.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 30', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=0&g=status&l=0&rtl=0&t=multiple-lines-multiple-files.json&ui=1&un=1&ut=0&w=0&ch=1280'
    ));

  test('with activity grouping test 31', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=0&g=status&l=stacked&rtl=0&t=multiple-lines-multiple-files.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 32', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=0&g=1&l=stacked&rtl=0&t=carousel-layout.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 33', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=0&bn=1&bt=0&g=sender&l=stacked&rtl=0&t=carousel-layout.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 34', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=0&bn=1&bt=0&g=sender&l=stacked&rtl=0&t=carousel-layout.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 35', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=0&bn=1&bt=0&g=sender&l=stacked&rtl=0&t=carousel-layout.json&ui=1&un=1&ut=0&w=0&ch=1280'
    ));

  test('with activity grouping test 36', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=0&bn=1&bt=0&g=sender&l=0&rtl=0&t=user-upload.json&ui=1&un=1&ut=0&w=1&ch=1280&cw=720'
    ));

  test('with activity grouping test 37', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=0&bn=0&bt=0&g=sender&l=carousel&rtl=0&t=single-line-no-files.json&ui=0&un=0&ut=0&w=0&ch=1280'
    ));

  test('with activity grouping test 38', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=sender&l=carousel&rtl=0&t=user-upload.json&ui=0&un=0&ut=0&w=0&ch=1280'
    ));

  test('with activity grouping test 39', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=sender&l=carousel&rtl=0&t=user-upload.json&ui=0&un=1&ut=0&w=0&ch=1280'
    ));

  test('with activity grouping test 40', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=0&bn=1&bt=1&g=status&l=carousel&rtl=0&t=user-upload.json&ui=0&un=1&ut=0&w=0&ch=1280'
    ));

  test('with activity grouping test 41', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=attachment-without-message.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 42', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=stacked&rtl=0&t=attachment-without-message.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 43', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=markdown-message.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 44', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=markdown-message.json&ui=1&un=1&ut=1&w=1&ch=1280&cw=720'
    ));

  // Test 45 is slightly (3px) shifted to the right.
  // This is because the carousel tries to center the first image, which result in setting scrollLeft to 3.3px.
  test('with activity grouping test 45', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=carousel&rtl=0&t=markdown-message.json&ui=1&un=1&ut=1&w=0&ch=1280'
    ));

  test('with activity grouping test 46', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=status&l=carousel&rtl=0&t=markdown-message.json&ui=1&un=1&ut=1&w=1&ch=1280&cw=720'
    ));

  test('with activity grouping test 47', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=1&l=0&rtl=0&t=carousel-hero-cards.json&ui=1&un=1&ut=1&w=0&ch=1280&cw=720'
    ));

  test('with activity grouping test 48', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=1&l=0&rtl=0&t=carousel-hero-cards.json&ui=1&un=1&ut=1&w=1&ch=1280&cw=720'
    ));

  test('with activity grouping test 49', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=1&l=stacked&rtl=0&t=carousel-hero-cards.json&ui=1&un=1&ut=1&w=0&ch=1280&cw=720'
    ));

  test('with activity grouping test 50', () =>
    runHTML(
      'transcript.activityGrouping#wd=1&bi=1&bn=1&bt=1&g=1&l=stacked&rtl=0&t=carousel-hero-cards.json&ui=1&un=1&ut=1&w=1&ch=1280&cw=720'
    ));
});
