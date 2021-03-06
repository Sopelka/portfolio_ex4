import * as yup from 'yup';

export const schema = yup.object().shape({
    email: yup
        .string()
        .min(5, 'Данное поле обязательно для заполнения')
        .required('*'),
    password: yup
        .string()
        .min(8, 'Минимальная длина пароля - 8 символов')
        .required('*'),
});

export const getLoginPlaceholder = () => {
    return {
        email:    'Электропочта',
        password: 'Пароль',
    };
};
