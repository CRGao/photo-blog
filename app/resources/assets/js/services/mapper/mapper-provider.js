import {Mapper, optional as opt} from "tooleks";
import router from "../../router";

export default function (dateService) {
    const mapperService = new Mapper;

    mapperService.registerResolver("Api.User", "User", function (user) {
        return {
            id: user.id,
            name: user.name,
            expires_at: (new Date).setSeconds(user.expires_in).valueOf(),
        };
    });

    mapperService.registerResolver("Api.Post", "Photo", function (post) {
        if (typeof post === "undefined" || post === null) {
            return null;
        }

        const route = router.history.current;
        return {
            id: opt(() => post.id),
            route: {
                name: "photo",
                params: {id: opt(() => post.id)},
                query: {
                    tag: route.params.tag || route.query.tag,
                    search_phrase: route.params.search_phrase || route.query.search_phrase,
                    page: route.params.page || route.query.page,
                },
            },
            description: opt(() => post.description),
            exif: mapperService.map(opt(() => post.photo.exif), "Api.Exif", "Exif"),
            averageColor: opt(() => post.photo.avg_color),
            thumbnail: mapperService.map(opt(() => post.photo.thumbnails.medium), "Api.Thumbnail", "Thumbnail"),
            original: mapperService.map(opt(() => post.photo.thumbnails.large), "Api.Thumbnail", "Thumbnail"),
            tags: opt(() => post.tags || [], []).map((tag) => mapperService.map(tag, "Api.Tag", "Tag")),
            location: mapperService.map(opt(() => post.photo.location), "Api.Location", "Location"),
            toString: () => opt(() => post.photo.thumbnails.large.url),
            is: (image) => opt(() => image.id) === opt(() => post.id),
        };
    });

    mapperService.registerResolver("Api.Post", "Map.Image", function (post) {
        return {
            imageUrl: opt(() => post.photo.thumbnails.large.url),
            linkUrl: opt(() => `/photo/${post.id}`),
            title: opt(() => post.description),
            location: mapperService.map(opt(() => post.photo.location), "Api.Location", "Location"),
        };
    });

    mapperService.registerResolver("Api.Thumbnail", "Thumbnail", function (thumbnail) {
        return {
            url: opt(() => thumbnail.url),
            width: opt(() => thumbnail.width),
            height: opt(() => thumbnail.height),
        };
    });

    mapperService.registerResolver("Api.Exif", "Exif", function (exif) {
        return {
            manufacturer: opt(() => exif.manufacturer),
            model: opt(() => exif.model),
            exposureTime: opt(() => exif.exposure_time),
            aperture: opt(() => exif.aperture),
            iso: opt(() => exif.iso),
            takenAt: opt(() => exif.taken_at) ? dateService.format(exif.taken_at) : opt(() => exif.taken_at),
        };
    });

    mapperService.registerResolver("Api.Tag", "Tag", function (tag) {
        return opt(() => tag.value);
    });

    mapperService.registerResolver("Api.Subscription", "Subscription", function (subscription) {
        return {
            email: opt(() => subscription.email),
            token: opt(() => subscription.token),
        };
    });

    mapperService.registerResolver("Api.Location", "Location", function (location) {
        if (typeof location === "undefined" || location === null) {
            return null;
        }

        return {
            lat: opt(() => location.latitude),
            lng: opt(() => location.longitude),
        };
    });

    mapperService.registerResolver("Tag", "Api.Tag", function (tag) {
        return {
            value: tag,
        };
    });

    mapperService.registerResolver("Location", "Api.Location", function (location) {
        if (typeof location === "undefined" || location === null) {
            return null;
        }

        return {
            latitude: opt(() => location.lat),
            longitude: opt(() => location.lng),
        };
    });

    mapperService.registerResolver("Api.Raw.Post", "Photo", function (response) {
        const {data: post} = response;
        return mapperService.map(post, "Api.Post", "Photo");
    });

    mapperService.registerResolver("Api.Raw.Post", "Component.PhotoModify", function ({response, component}) {
        const {data: post} = response;
        component.post = post;
        component.description = opt(() => post.description);
        component.tags = opt(() => post.tags || [], []).map((tag) => mapperService.map(tag, "Api.Tag", "Tag"));
        component.location = opt(() => {
            return {
                lat: post.photo.location.latitude,
                lng: post.photo.location.longitude,
            };
        }, null);
        return component;
    });

    mapperService.registerResolver("Api.Raw.Photo", "Component.PhotoModify", function ({response, component}) {
        const {data: photo} = response;
        component.post = component.post || {};
        component.post.photo = photo;
        return component;
    });

    mapperService.registerResolver("Component.PhotoModify", "Api.Post", function (component) {
        return {
            id: opt(() => component.postId),
            photo: {id: opt(() => component.photoId)},
            description: opt(() => component.description),
            tags: component.tags.map((tag) => mapperService.map(tag, "Tag", "Api.Tag")),
        };
    });

    mapperService.registerResolver("Component.PhotoModify", "Api.Photo", function (component) {
        return {
            location: {
                latitude: opt(() => component.location.lat),
                longitude: opt(() => component.location.lng),
            },
        };
    });

    mapperService.registerResolver("Api.Raw.Posts", "Component", function ({response, component}) {
        const {data: body} = response;
        component.photos = body.data.map((post) => mapperService.map(post, "Api.Post", "Photo"));
        component.previousPageExists = Boolean(body.prev_page_url);
        component.nextPageExists = Boolean(body.next_page_url);
        component.currentPage = Number(body.current_page);
        component.nextPage = component.nextPageExists ? component.currentPage + 1 : null;
        component.previousPage = component.previousPageExists ? component.currentPage - 1 : null;
        return component;
    });

    mapperService.registerResolver("Api.Raw.Subscriptions", "Component", function ({response, component}) {
        const {data: body} = response;
        component.subscriptions = body.data.map((subscription) => mapperService.map(subscription, "Api.Subscription", "Subscription"));
        component.previousPageExists = Boolean(body.prev_page_url);
        component.nextPageExists = Boolean(body.next_page_url);
        component.currentPage = Number(body.current_page);
        component.nextPage = component.nextPageExists ? component.currentPage + 1 : null;
        component.previousPage = component.previousPageExists ? component.currentPage - 1 : null;
        return component;
    });

    mapperService.registerResolver("Api.Raw.Tags", "Component", function ({response, component}) {
        const {data: body} = response;
        component.tags = body.data.map((tag) => mapperService.map(tag, "Api.Tag", "Tag"));
        component.previousPageExists = Boolean(body.prev_page_url);
        component.nextPageExists = Boolean(body.next_page_url);
        component.currentPage = Number(body.current_page);
        component.nextPage = component.nextPageExists ? component.currentPage + 1 : null;
        component.previousPage = component.previousPageExists ? component.currentPage - 1 : null;
        return component;
    });

    return mapperService;
};
