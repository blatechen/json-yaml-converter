import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/format/json'
    },
    {
        path: '/format/json',
        name: 'JsonFormatter',
        component: () => import('../views/format/JsonFormatter.vue')
    },
    {
        path: '/convert/props-yaml',
        name: 'PropsYamlConverter',
        component: () => import('../views/convert/PropsYamlConverter.vue')
    },
    {
        path: '/convert/json-pojo',
        name: 'JsonToPojo',
        component: () => import('../views/convert/JsonToPojo.vue')
    },
    {
        path: '/image/base64',
        name: 'ImageToBase64',
        component: () => import('../views/image/ImageToBase64.vue')
    },
    {
        path: '/image/ocr',
        name: 'OcrRecognition',
        component: () => import('../views/image/OcrRecognition.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
