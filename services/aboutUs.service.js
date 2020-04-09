import { AboutUs } from '../../models';

async function insertAboutUs(payload) {
  const findQuery = {
    position: payload.position,
  };
  const result = await AboutUs.findOne(findQuery);
  if (result) {
    throw 'Position already exist';
  }

  let data = {
    title: payload.title,
    subtitle: payload.subtitle,
    description: payload.description,
    position: payload.position,
  };
  const doc = await AboutUs.create(data);
  return doc;
}

async function listAboutUsData(reqParams) {
  const { pageIndex, pageSize, search } = reqParams;
  let findQuery = {};
  if (search) {
    findQuery = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    };
  }
  const options = {
    page: pageIndex,
    limit: pageSize,
    sort: { updatedAt: -1 },
  };
  let doc = await AboutUs.paginate(findQuery, options);
  return doc;
}

async function deleteAboutUs(payload) {
  const res = await AboutUs.deleteOne({ _id: payload.aboutId });
  if (!res) {
    throw 'No Found';
  }
  return res;
}

async function getAboutUsById(id) {
  const about = await AboutUs.findById(id);
  if (!about) {
    throw 'No Found';
  }
  return about;
}

async function updateAboutUsData(aboutId, payload) {
  let aboutInfo = await AboutUs.findOneAndUpdate(
    { _id: aboutId },
    {
      $set: payload,
    },
    {
      new: true,
    },
  );
  return aboutInfo;
}

export {
  insertAboutUs,
  listAboutUsData,
  deleteAboutUs,
  updateAboutUsData,
  getAboutUsById,
};
