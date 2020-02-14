/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import {NamedTensorInfoMap, registerKernel, TensorInfo} from '../../../kernel_registry';
import * as broadcast_util from '../../../ops/broadcast_util';
import {upcastType} from '../../../types';
import {sizeFromShape} from '../../../util';
import {MathBackendCPU} from '../backend_cpu';

import {div} from './div_impl';

interface DivInputs extends NamedTensorInfoMap {
  a: TensorInfo;
  b: TensorInfo;
}

registerKernel({
  kernelName: 'Div',
  backendName: 'cpu',
  kernelFunc: ({inputs, backend}) => {
    const {a, b} = inputs as DivInputs;
    const cpuBackend = backend as MathBackendCPU;

    const dtype = upcastType(a.dtype, b.dtype);
    const outShape =
        broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
    const outValues = new Float32Array(sizeFromShape(outShape));

    const aVals = cpuBackend.data.get(a.dataId).values as Float32Array;
    const bVals = cpuBackend.data.get(b.dataId).values as Float32Array;

    const result = div(aVals, a.shape, bVals, b.shape, outValues, outShape);

    const dataId = cpuBackend.write(result, outShape, dtype);
    return {dataId, shape: outShape, dtype};
  }
});