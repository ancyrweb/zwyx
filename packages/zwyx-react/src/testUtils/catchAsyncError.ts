export default function catchAsyncError(done, cb) {
  try {
    cb();
  } catch (e) {
    done.fail(e);
  }
}
