// 1st

// import ReactWebChat, { createStyleSet, StyleOptions } from 'botframework-webchat';

// function main() {
//   const styleOptions: StyleOptions = { accent: 'black', cardEmphasisBackgroundColor: 'orange' };

//   createStyleSet(styleOptions);

//   // Verify: "dir" must be a string, otherwise, it must fail.
//   return <ReactWebChat dir="ltr" styleOptions={styleOptions} />;
//   // return <ReactWebChat dir={123} styleOptions={styleOptions} />;
// }

// 2nd

// import ReactWebChat, { createStyleSet, StyleOptions } from 'botframework-webchat/lib/index-minimal';

// function main() {
//   // Verify: Setting "cardEmphasisBackgroundColor" must fail.
//   const styleOptions: StyleOptions = { accent: 'black' };
//   // const styleOptions: StyleOptions = { cardEmphasisBackgroundColor: 'orange' };

//   // Verify: "createStyleSet" should not accept "cardEmphasisBackgroundColor".
//   createStyleSet(styleOptions);
//   // createStyleSet({ cardEmphasisBackgroundColor: 'orange' });

//   // Verify: "dir" must be a string, otherwise, it must fail.
//   return <ReactWebChat dir="ltr" styleOptions={styleOptions} />;
//   // return <ReactWebChat dir={123} styleOptions={styleOptions} />;
// }

// 3rd

// import { Components, StyleOptions } from 'botframework-webchat';

// const { BasicSendBox, BasicWebChat, Composer } = Components;

// function main() {
//   const styleOptions: StyleOptions = { accent: 'black', cardEmphasisBackgroundColor: 'orange' };

//   return (
//     // Verify: "dir" must be a string, otherwise, it must fail.
//     <Composer dir="ltr" styleOptions={styleOptions}>
//       {/* <Composer dir={123} styleOptions={styleOptions}> */}
//       <BasicWebChat />
//       <BasicSendBox />
//     </Composer>
//   );
// }

// 4th

// import { Components, StyleOptions } from 'botframework-webchat/lib/index-minimal';

// const { BasicSendBox, BasicWebChat, Composer } = Components;

// function main() {
//   // Verify: Setting "cardEmphasisBackgroundColor" must fail.
//   const styleOptions: StyleOptions = { accent: 'black' };
//   // const styleOptions: StyleOptions = { cardEmphasisBackgroundColor: 'black' };

//   return (
//     // Verify: "dir" must be a string, otherwise, it must fail.
//     <Composer dir="ltr" styleOptions={styleOptions}>
//       {/* <Composer dir={123} styleOptions={styleOptions}> */}
//       <BasicWebChat />
//       <BasicSendBox />
//     </Composer>
//   );
// }

// type Replace<T1, T2> = Omit<T1, keyof T2> & T2;

// type A = { a: string };
// type B = { a: number };
// type C = A & B;         // C.a is of type "never", because "string & number" is "never"
// type D = Replace<A, B>; // D.a is of type "number"

// type Expando<T> = Replace<any, T>;

// type E = Expando<{ a: string }>;
// type F = { a: string };

// const e: E = { a: 'John', b: 123 }; // E.b is assignable and can hold "any"
// const f: F = { a: 'John', b: 123 }; // F.b is not assignable
