#include <nan.h>

using namespace v8;

#define NANOS_PER_SEC 1000000000

namespace gctime {
  uint64_t start = 0;
  uint64_t min = 0;
  uint64_t max = 0;
  uint64_t sum = 0;
  uint32_t size = 0;

  bool listening = false;

  NAN_GC_CALLBACK(Prologue) {
    start = uv_hrtime();
  }

  NAN_GC_CALLBACK(Epilogue) {
    uint64_t duration = uv_hrtime() - start;
    start = 0;

    if (duration < min || size == 0) min = duration;
    if (duration > max || size == 0) max = duration;

    sum+= duration;
    size++;
  }

  static void ResetStatistics() {
    min = 0;
    max = 0;
    sum = 0;
    size = 0;
  }

  NAN_METHOD(Start) {
    if (listening) {
      return Nan::ThrowError("Already started");
    }

    ResetStatistics();
    listening = true;

    Nan::AddGCPrologueCallback(Prologue);
    Nan::AddGCEpilogueCallback(Epilogue);
  }

  NAN_METHOD(Transfer) {
    // Lifted from Node's process.hrtime, avoids integer overflow.
    Local<ArrayBuffer> ab = info[0].As<Uint32Array>()->Buffer();
    uint32_t* fields = static_cast<uint32_t*>(ab->GetContents().Data());

    // The first two entries contain seconds broken into upper/lower
    // 32 bits. The third entry contains the remaining nanoseconds.
    fields[0] = (min / NANOS_PER_SEC) >> 32;
    fields[1] = (min / NANOS_PER_SEC) & 0xffffffff;
    fields[2] = (min % NANOS_PER_SEC);

    fields[3] = (max / NANOS_PER_SEC) >> 32;
    fields[4] = (max / NANOS_PER_SEC) & 0xffffffff;
    fields[5] = (max % NANOS_PER_SEC);

    fields[6] = (sum / NANOS_PER_SEC) >> 32;
    fields[7] = (sum / NANOS_PER_SEC) & 0xffffffff;
    fields[8] = (sum % NANOS_PER_SEC);

    fields[9] = size;

    ResetStatistics();
  }

  NAN_METHOD(Stop) {
    if (!listening) {
      return Nan::ThrowError("Already stopped");
    }

    listening = false;
    Nan::RemoveGCPrologueCallback(Prologue);
    Nan::RemoveGCEpilogueCallback(Epilogue);
  }

  NAN_MODULE_INIT(Init) {
    Local<Function> start = Nan::GetFunction(Nan::New<FunctionTemplate>(Start)).ToLocalChecked();
    Nan::Set(target, Nan::New("start").ToLocalChecked(), start);

    Local<Function> transfer = Nan::GetFunction(Nan::New<FunctionTemplate>(Transfer)).ToLocalChecked();
    Nan::Set(target, Nan::New("transfer").ToLocalChecked(), transfer);

    Local<Function> stop = Nan::GetFunction(Nan::New<FunctionTemplate>(Stop)).ToLocalChecked();
    Nan::Set(target, Nan::New("stop").ToLocalChecked(), stop);
  }

  NODE_MODULE(gctime, Init)
}
