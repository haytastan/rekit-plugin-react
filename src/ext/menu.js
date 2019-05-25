import { Modal, message } from 'antd';
import store from 'rs/common/store';
import * as actions from 'rs/features/core/redux/actions';

const showDialog = (...args) => store.dispatch(actions.showDialog(...args));
const execCoreCommand = args => store.dispatch(actions.execCoreCommand(args));

const byId = id => store.getState().home.elementById[id];

const menuItems = {
  del: { name: 'Delete', key: 'react:del' },
  // move: { name: 'Move', key: 'move' },
  rename: { name: 'Rename', key: 'react:rename' },
  newComponent: { name: 'Add Component', key: 'react:new-component' },
};

export default {
  contextMenu: {
    fillMenuItems(items, { elementId }) {
      const ele = byId(elementId);
      if (!ele) return;
      switch (ele.type) {
        case 'folder':
          items.unshift(menuItems.newComponent);
          break;
        case 'component':
          items.push(menuItems.rename, menuItems.del);
          break;
        default:
          break;
      }
    },
    handleMenuClick({ elementId, key }) {
      switch (key) {
        case 'react:new-component': {
          showDialog('core.element.add.component', 'New Component', {
            action: 'add',
            targetId: elementId,
            elementType: 'component',
          });
          break;
        }
        case 'react:del': {
          Modal.confirm({
            title: 'Are you sure to delete the component?',
            onOk() {
              const ele = byId(elementId);
              if (!ele) {
                Modal.error({
                  title: 'No element to delete',
                  content: `Element not found: ${elementId}`,
                });
                return;
              }

              let name = null;
              let dirPath = null;
              switch (ele.type) {
                case 'component':
                  name = ele.name;
                  dirPath = ele.id.replace(/^v:|\/[^/]+$/g, ''); // v:src/App.js => src
                  break;
                default:
                  Modal.error({
                    title: 'Unknown element type to delete.',
                    content: `Element type not supported to delete: ${ele.type}`,
                  });
                  return;
              }
              execCoreCommand({
                commandName: 'remove',
                type: ele.type,
                name,
                dirPath,
              }).then(
                () => {
                  message.success('Delete element success.');
                },
                err => {
                  Modal.error({
                    title: 'Failed to delete the element',
                    content: err.toString(),
                  });
                },
              );
            },
          });
          break;
        }
        default:
          break;
      }
    },
  },
};
