import {
  AbstractConnector,
  ConnectorEvents,
  EventsMap,
} from '../../src/connectors/common';

export class ConnectorStub extends AbstractConnector {
  testEmit = <E extends ConnectorEvents>(event: E, args?: EventsMap[E]) => {
    this.emit(event, args);
  };
}
