export const smallJson = {
  name: 'acme',
  count: 42,
  tags: ['a', 'b', 'c'],
  active: true,
  meta: null,
};
export const smallJsonMinified = JSON.stringify(smallJson);
export const smallJsonPretty = JSON.stringify(smallJson, null, 2);

export const nestedJson = {
  store: {
    book: [
      { category: 'reference', author: 'Nigel', title: 'Sayings' },
      { category: 'fiction', author: 'Evelyn', title: 'Sword of Honour' },
      { category: 'fiction', author: 'Herman', title: 'Moby Dick' },
      { category: 'fiction', author: 'Tolkien', title: 'The Lord of the Rings' },
    ],
    bicycle: { color: 'red', price: 19.95 },
  },
  expensive: 10,
};

export const brokenJson = '{ "a": 1, "b": ]';

export const editableSample = {
  city: 'Ahmedabad',
  count: 5,
  keep: true,
};
