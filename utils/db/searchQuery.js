exports.createQuery = (field, searchVal) => {
  let query;

  const booleanFields = [];

  const numberFields = [];

  const removedFields = [];

  // Number Fields
  if (numberFields.includes(field)) {
    // check if searhVal is Number
    if (!Number.isNaN(+searchVal)) query = { [field]: +searchVal };
  }
  // Boolean fields
  else if (booleanFields.includes(field)) {
    if ("true".includes(searchVal)) query = { [field]: true };

    if ("false".includes(searchVal)) query = { [field]: false };
  }
  // String Fields
  else {
    if (!removedFields.includes(field))
      query = {
        [field]: {
          $regex: `.*${searchVal.toString().toLowerCase()}.*`,
          $options: "i",
        },
      };
  }

  return query;
};

exports.parseQuery = (query) => {
  Object.keys(query).forEach((key) => {
    query[key] = JSON.parse(
      JSON.stringify(query[key]).replace(
        /\b(gte|gt|lte|lt|ne|eq|in|nin)\b/g,
        (match) => `$${match}`
      )
    );
  });

  return query;
};
