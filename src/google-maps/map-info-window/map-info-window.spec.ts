import {Component} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {MapMarker} from '../map-marker/index';
import {
  createInfoWindowConstructorSpy,
  createInfoWindowSpy,
  TestingWindow
} from '../testing/fake-google-map-utils';

import {MapInfoWindow, MapInfoWindowModule} from './index';

describe('MapInfoWindow', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MapInfoWindowModule],
      declarations: [TestApp],
    });
  }));

  beforeEach(() => {
    TestBed.compileComponents();
  });

  afterEach(() => {
    const testingWindow: TestingWindow = window;
    delete testingWindow.google;
  });

  it('initializes a Google Map Info Window', () => {
    const infoWindowSpy = createInfoWindowSpy({});
    const infoWindowConstructorSpy =
        createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const fakeMap = {} as unknown as google.maps.Map;
    const infoWindowComponent =
        fixture.debugElement.query(By.directive(MapInfoWindow)).componentInstance;
    infoWindowComponent._setMap(fakeMap);
    fixture.detectChanges();

    expect(infoWindowConstructorSpy).toHaveBeenCalledWith({
      position: undefined,
      content: jasmine.any(Node),
    });
  });

  it('sets position', () => {
    const fakeMap = {} as unknown as google.maps.Map;
    const position: google.maps.LatLngLiteral = {lat: 5, lng: 7};
    const infoWindowSpy = createInfoWindowSpy({position});
    const infoWindowConstructorSpy =
        createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.position = position;
    const infoWindowComponent =
        fixture.debugElement.query(By.directive(MapInfoWindow)).componentInstance;
    infoWindowComponent._setMap(fakeMap);
    fixture.detectChanges();

    expect(infoWindowConstructorSpy).toHaveBeenCalledWith({
      position,
      content: jasmine.any(Node),
    });
  });

  it('sets options', () => {
    const fakeMap = {} as unknown as google.maps.Map;
    const options: google.maps.InfoWindowOptions = {
      position: {lat: 3, lng: 5},
      maxWidth: 50,
      disableAutoPan: true,
    };
    const infoWindowSpy = createInfoWindowSpy(options);
    const infoWindowConstructorSpy =
        createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = options;
    const infoWindowComponent =
        fixture.debugElement.query(By.directive(MapInfoWindow)).componentInstance;
    infoWindowComponent._setMap(fakeMap);
    fixture.detectChanges();

    expect(infoWindowConstructorSpy).toHaveBeenCalledWith({
      ...options,
      content: jasmine.any(Node),
    });
  });

  it('gives preference to position over options', () => {
    const fakeMap = {} as unknown as google.maps.Map;
    const position: google.maps.LatLngLiteral = {lat: 5, lng: 7};
    const options: google.maps.InfoWindowOptions = {
      position: {lat: 3, lng: 5},
      maxWidth: 50,
      disableAutoPan: true,
    };
    const infoWindowSpy = createInfoWindowSpy({...options, position});
    const infoWindowConstructorSpy =
        createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = options;
    fixture.componentInstance.position = position;
    const infoWindowComponent =
        fixture.debugElement.query(By.directive(MapInfoWindow)).componentInstance;
    infoWindowComponent._setMap(fakeMap);
    fixture.detectChanges();

    expect(infoWindowConstructorSpy).toHaveBeenCalledWith({
      ...options,
      position,
      content: jasmine.any(Node),
    });
  });

  it('exposes meethods that change the configuration of the info window', () => {
    const fakeMap = {} as unknown as google.maps.Map;
    const fakeMarker = {} as unknown as google.maps.Marker;
    const fakeMarkerComponent = {_marker: fakeMarker} as unknown as MapMarker;
    const infoWindowSpy = createInfoWindowSpy({});
    createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const infoWindowComponent =
        fixture.debugElement.query(By.directive(MapInfoWindow)).componentInstance;
    infoWindowComponent._setMap(fakeMap);
    fixture.detectChanges();

    infoWindowComponent.close();
    expect(infoWindowSpy.close).toHaveBeenCalled();

    infoWindowComponent.open(fakeMarkerComponent);
    expect(infoWindowSpy.open).toHaveBeenCalledWith(fakeMap, fakeMarker);
  });

  it('exposes methods that provide information about the info window', () => {
    const fakeMap = {} as unknown as google.maps.Map;
    const infoWindowSpy = createInfoWindowSpy({});
    createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const infoWindowComponent =
        fixture.debugElement.query(By.directive(MapInfoWindow)).componentInstance;
    infoWindowComponent._setMap(fakeMap);
    fixture.detectChanges();

    infoWindowSpy.getContent.and.returnValue('test content');
    expect(infoWindowComponent.getContent()).toBe('test content');

    infoWindowSpy.getPosition.and.returnValue(null);
    expect(infoWindowComponent.getPosition()).toBe(null);

    infoWindowSpy.getZIndex.and.returnValue(5);
    expect(infoWindowComponent.getZIndex()).toBe(5);
  });

  it('initializes info window event handlers', () => {
    const fakeMap = {} as unknown as google.maps.Map;
    const infoWindowSpy = createInfoWindowSpy({});
    createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const infoWindowComponent =
        fixture.debugElement.query(By.directive(MapInfoWindow)).componentInstance;
    infoWindowComponent._setMap(fakeMap);
    fixture.detectChanges();

    expect(infoWindowSpy.addListener).toHaveBeenCalledWith('closeclick', jasmine.any(Function));
    expect(infoWindowSpy.addListener)
        .not.toHaveBeenCalledWith('content_changed', jasmine.any(Function));
    expect(infoWindowSpy.addListener).not.toHaveBeenCalledWith('domready', jasmine.any(Function));
    expect(infoWindowSpy.addListener)
        .not.toHaveBeenCalledWith('position_changed', jasmine.any(Function));
    expect(infoWindowSpy.addListener)
        .not.toHaveBeenCalledWith('zindex_changed', jasmine.any(Function));
  });
});

@Component({
  selector: 'test-app',
  template: `<map-info-window [position]="position"
                              [options]="options"
                              (closeclick)="handleClose()">test content</map-info-window>`,
})
class TestApp {
  position?: google.maps.LatLngLiteral;
  options?: google.maps.InfoWindowOptions;

  handleClose() {}
}
