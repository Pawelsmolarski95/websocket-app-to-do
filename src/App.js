import io from 'socket.io-client';
import { useEffect, useState } from "react";
import shortid from 'shortid';

const App = () => {
  
  const [socket, setSocket] = useState('');
  const [taskName, setTaskName] = useState('');
  const [tasks, setTasks] = useState([{id: 1, name:'Shopping'}]);
  const [taskToEdit, setTaskToEdit] = useState(null);
  
  useEffect(() => {
    const socket = io("localhost:8000");
    setSocket(socket);
    
    socket.on('updateDate', (tasks) => {
      updateTasks(tasks);
    });
    socket.on('addTask', (task) => {
      addTask(task);
    });
    socket.on('removeTask', (id) => {
      removeTask(id);
    })
    socket.on('editTask', (task) => {
      editTask(task);
    });
    
  },[]);
  
  const submitForm = (e) => {
    e.preventDefault();
    const task = { name: taskName, id: shortid() };
    addTask(task);
    socket.emit('addTask', task);
    setTaskName('');
  };
  const addTask = (task) => {
    setTasks([...tasks, task]);
    setTaskName('');
  };
  const removeTask = (taskId, local) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    if(local) {socket.emit('removeTask', taskId)}
  };
  const updateTasks = (tasksData) => {
    setTasks(tasksData);
  };
  const showEdit = (e, taskId) => {
    e.preventDefault();
    setTaskToEdit(taskId);
  };
  const editTask = (e, taskData, onClient) => {
    e.preventDefault();
    setTasks(tasks.map(task => (task.id === taskData.id ? {...task, ...{name: taskData.name}} : task )));
    if(onClient) { socket.emit('editTask', (taskData)) }
    setTaskName('');
    setTaskToEdit(null);
  }
  
  
  
  return (
    <div className="App">
  
      <header>
        <h1>ToDoList.app</h1>
      </header>
  
      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>
  
        <ul className="tasks-section__list" id="tasks-list">
        {tasks.map(task => (
          <li key={task.id} className="task">
            {task.name} 
            <button className="btn btn--red" onClick={() => removeTask(task.id, true)}>Remove</button>
            <button className="btn btn--green" onClick={(e) => showEdit(e, task.id)}>Edit</button>
            <div>
              <form 
                id="add-task-form" 
                className={taskToEdit !== task.id ? "hide" : null}
                onSubmit={(e) => editTask(e,{id: task.id, name: taskName}, true)}>
                <input 
                  className="text-input" 
                  autocomplete="off" 
                  type="text" 
                  placeholder={task.name}
                  id="task-name" 
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  />
                <button className="btn" type="submit">Change</button>
              </form>
            </div>
          </li>
        ))} 
        </ul>
  
        <form id="add-task-form" onSubmit={(e) => submitForm(e)}>
          <input className="text-input" autocomplete="off" type="text" placeholder="Type your description" id="task-name" onChange={(e) => setTaskName(e.target.value)}/>
          <button className="btn" type="submit">Add</button>
        </form>
  
      </section>
    </div>
  );
}

export default App;
