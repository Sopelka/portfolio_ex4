// @ts-nocheck
// Core
import {
    useState,
    useEffect,
    createRef,
    useContext,
} from 'react';

import { useDispatch, useSelector } from 'react-redux';

import DatePicker, { registerLocale } from 'react-datepicker';
import ru from 'date-fns/locale/ru';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema } from './config';
import {
    setNewTask,
    setAllTask,
    setTaskInForm,
    setCompletedTasks,
} from '../../../lib/redux/init/actions';

import { TaskContext } from '../../../context/taskContext';

// hooks
import {
    useCreate,
    useAllTasks,
    useDeleteTodo,
    useUpdateTodoById,
} from '../../../hooks';

// helpers
import { getTagInfo, getFromLocalStorage } from '../../../helpers';


registerLocale('ru', ru);

export const ActualTaskForm = () => {
    const form = useForm({
        mode:     'onTouched',
        resolver: yupResolver(schema),
    });

    const dispatch = useDispatch();

    const [startDate, setStartDate] = useState(null);

    const [selectedTag, setSelectedTag] = useState(null);

    const inputTitle = createRef();
    const inputDescription = createRef();
    let theDate;

    const theState = useContext(TaskContext);

    const tags = useSelector((state) => { return state.allTags; });
    const chosenTodo = useSelector((state) => { return state.setTaskInForm; });
    let theId = chosenTodo?.id;

    const creation = useCreate();
    const deletion = useDeleteTodo();
    const updating = useUpdateTodoById(theId);

    const token = getFromLocalStorage('token');
    const allTasks = useAllTasks(token);

    useEffect(() => {
        if (chosenTodo !== null) {
            theId = chosenTodo.id;
            // Инпут название
            inputTitle.current.value = chosenTodo?.title;
            // Инпут описание
            inputDescription.current.value = chosenTodo?.description;
            // Инпут дата
            theDate = new Date(chosenTodo?.deadline);
            setStartDate(theDate);
            // Инпут тэг
            theState.setVisible(true);
        }
    }, [chosenTodo]);


    const toCreate = form.handleSubmit(async (data) => {
        await creation.mutateAsync({
            ...data,
            deadline: startDate,
            tag:      selectedTag,
        });

        const result = getTagInfo(selectedTag, tags);

        dispatch(setNewTask({
            ...data,
            deadline: startDate,
            tag:      result,
        }));

        const tasks = await allTasks.mutateAsync(token);
        dispatch(setAllTask(null));
        dispatch(setAllTask(tasks.data.data));
        dispatch(setTaskInForm(null));

        theState.toggle();
    });

    const toUpdate = form.handleSubmit(async (data) => {
        await updating.mutateAsync({
            ...data,
            deadline: startDate,
            tag:      selectedTag,
        });

        const tasks = await allTasks.mutateAsync(token);
        dispatch(setAllTask(null));
        dispatch(setAllTask(tasks.data.data));
        dispatch(setTaskInForm(null));

        theState.toggle();
    });

    const toDelete = async () => {
        await deletion.mutateAsync(theId);

        const tasks = await allTasks.mutateAsync(token);
        dispatch(setAllTask(null));
        dispatch(setAllTask(tasks.data.data));
        dispatch(setTaskInForm(null));

        theState.toggle();
    };

    const toComplete = (event) => {
        event.preventDefault();

        dispatch(setCompletedTasks(chosenTodo?.id));
    };

    return (
        <div className = 'task-card'>
            <form>
                <div className = 'head'>
                    <button onClick = { toComplete } className = 'button-complete-task'>Завершить</button>
                    <div onClick = { toDelete } className = 'button-remove-task'></div>
                </div>
                <div className = 'content'>
                    <label className = 'label'>
                        Задача
                        <input
                            { ...form.register('title') }
                            id = 'form-title'
                            name = 'title'
                            ref = { inputTitle }
                            className = 'title'
                            placeholder = 'Пройти интенсив по React + Redux'
                            type = 'text' />
                    </label>
                    <div className = 'deadline'>
                        <span className = 'label'>Дедлайн</span>
                        <span className = 'date' >
                            <DatePicker
                                minDate = { new Date() }
                                selected = { startDate }
                                onChange = { (date) => setStartDate(date) }
                                locale = { ru }
                                placeholderText = 'Выберите дату'
                                dateFormat = 'dd MMMM yyyy'
                                showDisabledMonthNavigation />
                        </span>
                    </div>
                    <div className = 'description'>
                        <label className = 'label'>
                            Описание
                            <input
                                { ...form.register('description') }
                                name = 'description'
                                ref = { inputDescription }
                                id = 'description'
                                className = 'text'
                                placeholder = 'Изучить все технологии в сочетании со специальными библиотеками' />
                        </label>
                    </div>
                    <div className = 'tags'>
                        { tags?.map((tag) => <span
                            className = 'tag'
                            key = { tag.id }
                            id = { tag.id }
                            style = { { color: tag.color, backgroundColor: tag.bg } }
                            onClick = { (event) => { setSelectedTag(event.target.id); } } >
                            { tag.name }
                        </span>) }
                    </div>
                    <div className = 'errors'>
                        <p className = 'errorMessage'>{ form.formState.errors?.title?.message }</p>
                        <p className = 'errorMessage'>{ form.formState.errors?.description?.message }</p>
                        <p style = { { color: '#868686' }  } className = 'errorMessage'>Обязательно укажите название, время, описание и тег вашей задачи</p>
                    </div>
                    <div className = 'form-controls'>
                        <button className = 'button-reset-task' type = 'reset'>Reset</button>
                        <button
                            onClick = { toCreate }
                            className = 'button-save-task'
                            type = 'submit'>Save new task</button>
                        { chosenTodo !== null ? <button
                            onClick = { toUpdate }
                            className = 'button-save-task'
                            type = 'submit'>Update task</button>
                            : null }
                    </div>
                </div>
            </form>
        </div>
    );
};

