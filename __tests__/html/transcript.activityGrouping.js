/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('transcript', () => {
  test('with activity grouping test 1', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=simple-messages.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 2', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=simple-messages.json&ui=1&un=1&ut=1&w=1',
      { height: 1280, width: 720 }
    ));

  test('with activity grouping test 3', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=1&t=simple-messages.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 4', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=sender&l=0&rtl=0&t=simple-messages.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 5', () =>
    runHTMLTest('transcript.activityGrouping#bi=1&bn=1&bt=1&g=1&l=0&rtl=0&t=simple-messages.json&ui=1&un=1&ut=1&w=0', {
      height: 1280
    }));

  test('with activity grouping test 6', () =>
    runHTMLTest('transcript.activityGrouping#bi=0&bn=1&bt=1&g=1&l=0&rtl=0&t=simple-messages.json&ui=1&un=1&ut=1&w=0', {
      height: 1280
    }));

  test('with activity grouping test 7', () =>
    runHTMLTest('transcript.activityGrouping#bi=0&bn=0&bt=1&g=1&l=0&rtl=0&t=simple-messages.json&ui=1&un=1&ut=1&w=0', {
      height: 1280
    }));

  test('with activity grouping test 8', () =>
    runHTMLTest('transcript.activityGrouping#bi=0&bn=1&bt=0&g=1&l=0&rtl=0&t=simple-messages.json&ui=1&un=1&ut=1&w=0', {
      height: 1280
    }));

  test('with activity grouping test 9', () =>
    runHTMLTest('transcript.activityGrouping#bi=1&bn=1&bt=1&g=1&l=0&rtl=0&t=simple-messages.json&ui=0&un=1&ut=1&w=0', {
      height: 1280
    }));

  test('with activity grouping test 10', () =>
    runHTMLTest('transcript.activityGrouping#bi=1&bn=1&bt=1&g=1&l=0&rtl=0&t=simple-messages.json&ui=0&un=1&ut=0&w=0', {
      height: 1280
    }));

  test('with activity grouping test 11', () =>
    runHTMLTest('transcript.activityGrouping#bi=0&bn=0&bt=1&g=1&l=0&rtl=0&t=simple-messages.json&ui=0&un=0&ut=0&w=0', {
      height: 1280
    }));

  test('with activity grouping test 12', () =>
    runHTMLTest('transcript.activityGrouping#bi=0&bn=1&bt=1&g=1&l=0&rtl=0&t=simple-messages.json&ui=0&un=0&ut=0&w=0', {
      height: 1280
    }));

  test('with activity grouping test 13', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=carousel-layout.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 14', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=carousel-layout.json&ui=1&un=1&ut=1&w=1',
      { height: 1280, width: 720 }
    ));

  test('with activity grouping test 15', () =>
    runHTMLTest('transcript.activityGrouping#bi=1&bn=1&bt=1&g=1&l=0&rtl=0&t=carousel-layout.json&ui=1&un=1&ut=1&w=0', {
      height: 1280
    }));

  test('with activity grouping test 16', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=carousel-layout.json&ui=0&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 17', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=carousel-layout.json&ui=0&un=0&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 18', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=0&g=status&l=0&rtl=0&t=carousel-layout.json&ui=0&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 19', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=0&g=status&l=stacked&rtl=0&t=carousel-layout.json&ui=0&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 20', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=multiple-lines-multiple-files.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 21', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=stacked&rtl=0&t=multiple-lines-multiple-files.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 22', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=0&bn=0&bt=1&g=status&l=stacked&rtl=0&t=multiple-lines-multiple-files.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 23', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=0&bn=0&bt=1&g=status&l=0&rtl=0&t=multiple-lines-multiple-files.json&ui=1&un=1&ut=1&w=1',
      { height: 1280, width: 720 }
    ));

  test('with activity grouping test 24', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=single-line-no-files.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 25', () =>
    runHTMLTest('transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=user-upload.json&ui=1&un=1&ut=1&w=0', {
      height: 1280
    }));

  test('with activity grouping test 26', () =>
    runHTMLTest('transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=user-upload.json&ui=1&un=1&ut=1&w=1', {
      height: 1280,
      width: 720
    }));

  test('with activity grouping test 27', () =>
    runHTMLTest('transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=user-upload.json&ui=1&un=1&ut=0&w=0', {
      height: 1280
    }));

  test('with activity grouping test 28', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=stacked&rtl=0&t=user-upload.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 29', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=1&l=0&rtl=0&t=multiple-lines-multiple-files.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 30', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=0&g=status&l=0&rtl=0&t=multiple-lines-multiple-files.json&ui=1&un=1&ut=0&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 31', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=0&g=status&l=stacked&rtl=0&t=multiple-lines-multiple-files.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 32', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=0&g=1&l=stacked&rtl=0&t=carousel-layout.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 33', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=0&bn=1&bt=0&g=sender&l=stacked&rtl=0&t=carousel-layout.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 34', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=0&bn=1&bt=0&g=sender&l=stacked&rtl=0&t=carousel-layout.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 35', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=0&bn=1&bt=0&g=sender&l=stacked&rtl=0&t=carousel-layout.json&ui=1&un=1&ut=0&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 36', () =>
    runHTMLTest('transcript.activityGrouping#bi=0&bn=1&bt=0&g=sender&l=0&rtl=0&t=user-upload.json&ui=1&un=1&ut=0&w=1', {
      height: 1280,
      width: 720
    }));

  test('with activity grouping test 37', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=0&bn=0&bt=0&g=sender&l=carousel&rtl=0&t=single-line-no-files.json&ui=0&un=0&ut=0&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 38', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=sender&l=carousel&rtl=0&t=user-upload.json&ui=0&un=0&ut=0&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 39', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=sender&l=carousel&rtl=0&t=user-upload.json&ui=0&un=1&ut=0&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 40', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=0&bn=1&bt=1&g=status&l=carousel&rtl=0&t=user-upload.json&ui=0&un=1&ut=0&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 41', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=attachment-without-message.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 42', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=stacked&rtl=0&t=attachment-without-message.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 43', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=markdown-message.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 44', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=0&rtl=0&t=markdown-message.json&ui=1&un=1&ut=1&w=1',
      { height: 1280, width: 720 }
    ));

  test('with activity grouping test 45', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=carousel&rtl=0&t=markdown-message.json&ui=1&un=1&ut=1&w=0',
      { height: 1280 }
    ));

  test('with activity grouping test 46', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=status&l=carousel&rtl=0&t=markdown-message.json&ui=1&un=1&ut=1&w=1',
      { height: 1280, width: 720 }
    ));

  test('with activity grouping test 47', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=1&l=0&rtl=0&t=carousel-hero-cards.json&ui=1&un=1&ut=1&w=0',
      { height: 1280, width: 720 }
    ));

  test('with activity grouping test 48', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=1&l=0&rtl=0&t=carousel-hero-cards.json&ui=1&un=1&ut=1&w=1',
      { height: 1280, width: 720 }
    ));

  test('with activity grouping test 49', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=1&l=stacked&rtl=0&t=carousel-hero-cards.json&ui=1&un=1&ut=1&w=0',
      { height: 1280, width: 720 }
    ));

  test('with activity grouping test 50', () =>
    runHTMLTest(
      'transcript.activityGrouping#bi=1&bn=1&bt=1&g=1&l=stacked&rtl=0&t=carousel-hero-cards.json&ui=1&un=1&ut=1&w=1',
      { height: 1280, width: 720 }
    ));
});
