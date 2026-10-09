import test from 'node:test';
import assert from 'node:assert/strict';
import { v2 as cloudinary } from 'cloudinary';
import { cloudinarySign } from './cloudinary-edge.ts';

const apiSecret = 'super-secret';
const params = {
  folder: 'wedding-123/gallery',
  timestamp: 1710000000,
  upload_preset: 'wedding_upload',
};

test('cloudinarySign matches the official SDK for nested folder paths', async () => {
  const actual = await cloudinarySign(params, apiSecret);
  assert.equal(actual, cloudinary.utils.api_sign_request(params, apiSecret));
});

test('cloudinarySign matches the official SDK for ampersands and blank values', async () => {
  const paramsWithAmpersand = {
    ...params,
    context: 'caption=ceremony&alt=photo',
    optional: '',
    emptyArray: [],
  };
  const actual = await cloudinarySign(paramsWithAmpersand, apiSecret);
  assert.equal(actual, cloudinary.utils.api_sign_request(paramsWithAmpersand, apiSecret));
});
