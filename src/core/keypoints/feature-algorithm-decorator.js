/*
 * speedy-vision.js
 * GPU-accelerated Computer Vision for JavaScript
 * Copyright 2020-2021 Alexandre Martins <alemartf(at)gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * feature-algorithm-decorator.js
 * Decorator pattern applied to the FeatureAlgorithm class
 */

import { FeatureAlgorithm } from './feature-algorithm';
import { SpeedyFeature } from '../speedy-feature';
import { SpeedyPromise } from '../../utils/speedy-promise';
import { Utils } from '../../utils/utils';

/**
 * This decorator lets us extend and combine
 * the FeatureAlgorithm class in many ways
 * @abstract
 */
export class FeatureAlgorithmDecorator extends FeatureAlgorithm
{
    /**
     * Constructor
     * @param {FeatureAlgorithm} decoratedAlgorithm 
     * @param {number} [descriptorSize] in bytes, required for GPU algorithms
     * @param {number} [extraSize] in bytes, required for GPU algorithms
     */
    constructor(decoratedAlgorithm, descriptorSize = 0, extraSize = 0)
    {
        Utils.assert(decoratedAlgorithm instanceof FeatureAlgorithm);
        Utils.assert(descriptorSize >= decoratedAlgorithm.descriptorSize);
        Utils.assert(extraSize >= decoratedAlgorithm.extraSize);

        super(descriptorSize, extraSize);

        /** @type {FeatureAlgorithm} decorated algorithm */
        this._decoratedAlgorithm = decoratedAlgorithm;
        this._decoratedAlgorithm.descriptorSize = this.descriptorSize;
        this._decoratedAlgorithm.extraSize = this.extraSize;
    }

    /**
     * Abstract "run" operation:
     * runs something on the GPU
     * @param {SpeedyGPU} gpu
     * @param {SpeedyTexture} inputTexture
     * @returns {SpeedyTexture}
     */
    run(gpu, inputTexture)
    {
        return this._decoratedAlgorithm.run(gpu, inputTexture);
    }

    /**
     * Download feature points from the GPU
     * @param {SpeedyGPU} gpu
     * @param {SpeedyTexture} encodedKeypoints tiny texture with encoded keypoints
     * @param {FeatureDownloaderFlag} [flags] will be passed to the downloader
     * @returns {SpeedyPromise<SpeedyFeature[]>}
     */
    download(gpu, encodedKeypoints, flags = 0)
    {
        Utils.assert(this.extraSize == this._decoratedAlgorithm.extraSize);
        Utils.assert(this.descriptorSize == this._decoratedAlgorithm.descriptorSize);

        return this._decoratedAlgorithm.download(gpu, encodedKeypoints, flags);
    }

    /**
     * The decorated algorithm
     * @returns {FeatureAlgorithm}
     */
    get decoratedAlgorithm()
    {
        return this._decoratedAlgorithm;
    }

    /**
     * Extra size of the headers of the encoded keypoint texture
     * @return {number} in bytes
     */
    get extraSize()
    {
        return super.extraSize;
    }

    /**
     * Set the extra size of the headers of the encoded keypoint texture
     * @param {number} bytes a multiple of 4 (32 bits)
     */
    set extraSize(bytes)
    {
        super.extraSize = bytes;
        this._decoratedAlgorithm.extraSize = bytes;
    }

    /**
     * Descriptor size
     * @return {number} in bytes
     */
    get descriptorSize()
    {
        return super.descriptorSize;
    }

    /**
     * Set the descriptor size, in bytes
     * @param {number} bytes a multiple of 4 (32 bits)
     */
    set descriptorSize(bytes)
    {
        super.descriptorSize = bytes;
        this._decoratedAlgorithm.descriptorSize = bytes;
    }
}