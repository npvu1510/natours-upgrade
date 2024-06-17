import { model } from 'mongoose';

class ApiFilter {
  constructor(reqQuery, model, countDocuments, filter) {
    this.reqQuery = reqQuery;
    this.queryRes = model.find(filter);
    this.countDocuments = countDocuments;

    this.error = null;
  }

  filter() {
    // console.log(this.reqQuery);

    const specialFields = ['sort', 'fields', 'page', 'limit'];

    const reqQueryForFilter = { ...this.reqQuery };
    specialFields.forEach((field) => delete reqQueryForFilter[field]);

    // filter
    let reqQueryStr = JSON.stringify(reqQueryForFilter).replace(
      /\b(gt|lt|gte|lte)\b/g,
      (match) => `$${match}`,
    );

    this.queryRes.find(JSON.parse(reqQueryStr));
    return this;
  }

  sort() {
    if (this.reqQuery.sort) {
      const sortByStr = this.reqQuery.sort.split(',').join(' ');
      this.queryRes = this.queryRes.sort(sortByStr);
    }

    return this;
  }

  fields() {
    if (this.reqQuery.fields) {
      const fieldsStr = this.reqQuery.fields.split(',').join(' ');
      this.queryRes = this.queryRes.select(fieldsStr);
    } else this.queryRes = this.queryRes.select('-__v -createdAt -updatedAt');

    return this;
  }

  pagination() {
    const limit = this.reqQuery.limit || 100;
    const page = this.reqQuery.page || 1;
    const skip = (page - 1) * limit;

    if (skip < this.countDocuments)
      this.queryRes = this.queryRes.skip(skip).limit(limit);
    else this.error = new Error('Page not found');

    return this;
  }
}

export default ApiFilter;
