import ApiFilter from '../utils/ApiFilter.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // Parent resource
    const parentResource = Object.keys(req.params)[0];
    const filter = parentResource
      ? { [parentResource]: req.params[parentResource] }
      : {};

    const countDocuments = await Model.countDocuments();
    const api = new ApiFilter(req.query, Model, countDocuments, filter)
      .filter()
      .sort()
      .fields()
      .pagination();

    // if (api.error) return next(new AppError(400, api.error));

    // const docs = await api.queryRes.explain();
    const docs = await api.queryRes;

    return res
      .status(200)
      .json({ status: 'success', data: { length: docs.length, docs } });
  });

export const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    let query = Model.findById(id);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) return next(new AppError(404, 'Document not found'));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: 'success', data: { doc } });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const updatedDoc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      reValidators: true,
    });

    if (!updatedDoc) return next(new AppError(404, 'Document not found'));

    res.status(200).json({ status: 'success', data: { docs: updatedDoc } });
  });

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    await Model.findByIdAndDelete(id);
    return res.status(204).json({ status: 'success', data: null });
  });
