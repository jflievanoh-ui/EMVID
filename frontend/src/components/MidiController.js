import React, { useState } from "react";
import { useStudio } from "../contexts/StudioContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  Sliders, 
  Plus, 
  Settings,
  Trash2,
  Zap,
  Volume2,
  Mic,
  Video,
  Power,
  PowerOff
} from "lucide-react";

const MidiController = () => {
  const { midiDevices, audioSources, videoSources } = useStudio();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isAddMappingOpen, setIsAddMappingOpen] = useState(false);
  const [newMapping, setNewMapping] = useState({
    control: "",
    parameter: "",
    target: ""
  });

  const midiControls = [
    { id: 'fader_1', name: 'Fader 1', type: 'fader' },
    { id: 'fader_2', name: 'Fader 2', type: 'fader' },
    { id: 'fader_3', name: 'Fader 3', type: 'fader' },
    { id: 'fader_4', name: 'Fader 4', type: 'fader' },
    { id: 'knob_1', name: 'Knob 1', type: 'knob' },
    { id: 'knob_2', name: 'Knob 2', type: 'knob' },
    { id: 'knob_3', name: 'Knob 3', type: 'knob' },
    { id: 'knob_4', name: 'Knob 4', type: 'knob' },
    { id: 'button_1', name: 'Button 1', type: 'button' },
    { id: 'button_2', name: 'Button 2', type: 'button' },
    { id: 'button_3', name: 'Button 3', type: 'button' },
    { id: 'button_4', name: 'Button 4', type: 'button' },
  ];

  const parameters = [
    { id: 'volume', name: 'Volume', type: 'continuous' },
    { id: 'gain', name: 'Gain', type: 'continuous' },
    { id: 'mute', name: 'Mute', type: 'toggle' },
    { id: 'solo', name: 'Solo', type: 'toggle' },
    { id: 'enable', name: 'Enable', type: 'toggle' },
  ];

  const getAllTargets = () => {
    const targets = [];
    
    // Add audio sources
    audioSources.forEach(source => {
      targets.push({
        id: source.id,
        name: source.name,
        type: 'audio'
      });
    });
    
    // Add video sources
    videoSources.forEach(source => {
      targets.push({
        id: source.id,
        name: source.name,
        type: 'video'
      });
    });
    
    return targets;
  };

  const addMapping = () => {
    if (!selectedDevice || !newMapping.control || !newMapping.parameter || !newMapping.target) {
      return;
    }
    
    // In a real app, this would update the device mappings
    setIsAddMappingOpen(false);
    setNewMapping({ control: "", parameter: "", target: "" });
  };

  const removeMapping = (deviceId, mappingIndex) => {
    // In a real app, this would remove the mapping
    console.log('Remove mapping', deviceId, mappingIndex);
  };

  const getParameterIcon = (parameter) => {
    switch (parameter) {
      case 'volume':
        return <Volume2 className="w-4 h-4" />;
      case 'mute':
        return <Mic className="w-4 h-4" />;
      case 'enable':
        return <Power className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getTargetIcon = (target) => {
    const audioTarget = audioSources.find(s => s.id === target);
    const videoTarget = videoSources.find(s => s.id === target);
    
    if (audioTarget) return <Mic className="w-4 h-4" />;
    if (videoTarget) return <Video className="w-4 h-4" />;
    return <Settings className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">MIDI Controller</h2>
          <p className="text-purple-200 mt-1">
            Configure MIDI devices for hardware control
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-black/20 backdrop-blur-lg rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-200" />
              <span className="text-white font-medium">
                {midiDevices.filter(d => d.isConnected).length} Connected
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {midiDevices.map((device) => (
          <Card 
            key={device.id} 
            className="bg-black/20 backdrop-blur-lg border-white/10"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    device.isConnected ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    <Sliders className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{device.name}</CardTitle>
                    <CardDescription className="text-purple-200">
                      {device.type} • {device.mappings.length} mappings
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  className={
                    device.isConnected 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-white'
                  }
                >
                  {device.isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Device Status */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-purple-200 text-sm">Status</span>
                  <div className="flex items-center gap-2">
                    {device.isConnected ? (
                      <Power className="w-4 h-4 text-green-500" />
                    ) : (
                      <PowerOff className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-white text-sm">
                      {device.isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mappings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-medium">Control Mappings</Label>
                  <Dialog open={isAddMappingOpen} onOpenChange={setIsAddMappingOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedDevice(device)}
                        disabled={!device.isConnected}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Mapping
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-white/20">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add MIDI Mapping</DialogTitle>
                        <DialogDescription className="text-purple-200">
                          Map a MIDI control to a parameter
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-white">MIDI Control</Label>
                          <Select value={newMapping.control} onValueChange={(value) => setNewMapping(prev => ({ ...prev, control: value }))}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select control" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/20">
                              {midiControls.map(control => (
                                <SelectItem key={control.id} value={control.id}>
                                  {control.name} ({control.type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-white">Parameter</Label>
                          <Select value={newMapping.parameter} onValueChange={(value) => setNewMapping(prev => ({ ...prev, parameter: value }))}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select parameter" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/20">
                              {parameters.map(param => (
                                <SelectItem key={param.id} value={param.id}>
                                  {param.name} ({param.type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-white">Target</Label>
                          <Select value={newMapping.target} onValueChange={(value) => setNewMapping(prev => ({ ...prev, target: value }))}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select target" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/20">
                              {getAllTargets().map(target => (
                                <SelectItem key={target.id} value={target.id}>
                                  {target.name} ({target.type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsAddMappingOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={addMapping}>
                            Add Mapping
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {device.mappings.length > 0 ? (
                  <div className="space-y-2">
                    {device.mappings.map((mapping, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-purple-200" />
                            <span className="text-white text-sm font-medium">
                              {midiControls.find(c => c.id === mapping.control)?.name || mapping.control}
                            </span>
                          </div>
                          <span className="text-purple-200">→</span>
                          <div className="flex items-center gap-2">
                            {getParameterIcon(mapping.parameter)}
                            <span className="text-white text-sm">
                              {mapping.parameter}
                            </span>
                          </div>
                          <span className="text-purple-200">→</span>
                          <div className="flex items-center gap-2">
                            {getTargetIcon(mapping.target)}
                            <span className="text-white text-sm">
                              {audioSources.find(s => s.id === mapping.target)?.name || 
                               videoSources.find(s => s.id === mapping.target)?.name || 
                               mapping.target}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeMapping(device.id, index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-purple-200">
                    <Sliders className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No mappings configured</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {midiDevices.length === 0 && (
        <div className="text-center py-12">
          <Sliders className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No MIDI devices detected</h3>
          <p className="text-purple-200 mb-4">
            Connect a MIDI controller to enable hardware control
          </p>
        </div>
      )}
    </div>
  );
};

export default MidiController;