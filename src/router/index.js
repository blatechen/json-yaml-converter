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
        path: '/format/props-yaml',
        name: 'PropsYamlConverter',
        component: () => import('../views/format/PropsYamlConverter.vue')
    },
    {
        path: '/format/json-pojo',
        name: 'JsonToPojo',
        component: () => import('../views/format/JsonToPojo.vue')
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
