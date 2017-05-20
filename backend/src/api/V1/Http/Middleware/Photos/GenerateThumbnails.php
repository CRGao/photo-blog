<?php

namespace Api\V1\Http\Middleware\Photos;

use Closure;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Contracts\Filesystem\Factory as Storage;
use Lib\ThumbnailsGenerator\Contracts\ThumbnailsGenerator;

/**
 * Class GenerateThumbnails.
 *
 * @property Storage storage
 * @property ThumbnailsGenerator thumbnailsGenerator
 * @package Api\V1\Http\Middleware\Photos
 */
class GenerateThumbnails
{
    use ValidatesRequests;

    /**
     * GenerateThumbnails constructor.
     *
     * @param Storage $storage
     * @param ThumbnailsGenerator $thumbnailsGenerator
     */
    public function __construct(Storage $storage, ThumbnailsGenerator $thumbnailsGenerator)
    {
        $this->storage = $storage;
        $this->thumbnailsGenerator = $thumbnailsGenerator;
    }

    /**
     * Validate request.
     *
     * @param Request $request
     */
    public function validateRequest(Request $request)
    {
        $this->validate($request, [
            'path' => ['required', 'string'],
            'relative_url' => ['required', 'string'],
        ]);
    }

    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $this->validateRequest($request);

        $fileRelPath = $request->get('path');

        $fileAbsPath = $this->storage->getDriver()->getAdapter()->getPathPrefix() . $fileRelPath;

        $metaData = $this->thumbnailsGenerator->generateThumbnails($fileAbsPath);

        foreach ($metaData as $metaDataItem) {
            $relativeThumbnailPath = pathinfo($fileRelPath, PATHINFO_DIRNAME) . '/' . pathinfo($metaDataItem['path'], PATHINFO_BASENAME);
            $thumbnails[] = [
                'path' => $relativeThumbnailPath,
                'relative_url' => $this->storage->url($relativeThumbnailPath),
                'width' => $metaDataItem['width'],
                'height' => $metaDataItem['height'],
            ];
        }

        $request->merge(['thumbnails' => $thumbnails ?? []]);

        return $next($request);
    }
}
