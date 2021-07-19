// @ts-nocheck
/* Core */
// import { render } from 'react-dom';
import { FC, useContext } from 'react';

/* Components */
import { Footer } from '../components/Footer';
import { Nav } from '../components/Nav';
import { EmptyList } from '../components/EmptyList';
import { Controls } from '../components/Controls';
import { ActualTaskForm } from '../components/forms/taskForm';
import { TaskContext } from '../context/taskContext';

export const TaskPage: FC = () => {
    const state = useContext(TaskContext);


    return (
        <>
            <Nav />
            <main>
                <Controls />
                <div className = 'wrap' >
                    <EmptyList />
                    { state.isVisible === true ? <ActualTaskForm /> : null }
                </div>
            </main>
            <Footer />
        </>
    );
};
